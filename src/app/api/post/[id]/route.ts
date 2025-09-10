import { db } from "@/lib/db";
import { Tag } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: { params: any }) => {
  const { id } = params;
  const filter = req.nextUrl.searchParams.get("filter");

  try {
    let postData;
    if (!filter || filter == "tag" || filter == "search") {
      postData = await db.post.findUnique({
        where: { id },
        include: {
          files: true,
          _count: true,
          tags: true,
        },
      });
    } else if (filter == "video" || filter == "photo") {
      postData = await db.file.findUnique({
        where: { id },
        select: {
          post: {
            select: {
              id: true,
            },
          },
        },
      });
      postData = { id: postData?.post?.id };
    } else if (filter == "favorite") {
      postData = await db.favorite.findUnique({
        where: { id },
        select: {
          file: {
            select: {
              post: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });
      postData = { id: postData?.file.post?.id };
    }
    if (!postData) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }
    return NextResponse.json({ ok: true, postData });
  } catch (e: any) {
    let error = e?.code
      ? `Prisma errorCode:${e.code}, Prisma Error ${JSON.stringify(e.meta)}`
      : `다시 시도해주세요.`;
    return NextResponse.json({
      ok: false,
      error,
    });
  }
};

export const PATCH = async (req: NextRequest, { params }: { params: any }) => {
  const { id } = params;
  const { files, info } = (await req.json()) as {
    files: FileType[];
    info: InfoType;
  };
  try {
    // 1. 게시글 업데이트 (파일 교체 + 태그 관계 초기화)
    const postResult = await db.post.update({
      where: { id },
      data: {
        place: info.mapData.placeAddress,
        score: info.score,
        map: {
          lat: info.mapData.location.lat,
          lng: info.mapData.location.lng,
          placeAddress: info.mapData.placeAddress,
        },
        comment: info.comment,
        shootingDate: info.date,
        files: {
          deleteMany: {}, // 기존 파일 모두 삭제
          createMany: {
            data: files.map((f) => ({
              fileId: f.fileId,
              type: f.type,
              thumbnail: f.thumbnail,
              width: f.width,
              height: f.height,
              duration: f.duration ?? null,
              createdAt: new Date(),
            })),
          },
        },
        tags: {
          set: [], // ✅ 기존 태그 관계 끊기
        },
      },
      include: {
        files: true,
        tags: true,
      },
    });

    // 2. 새 태그 upsert + 연결
    for (const body of info.tag) {
      await db.tag.upsert({
        where: { body },
        create: {
          body,
          posts: { connect: { id } },
        },
        update: {
          posts: { connect: { id } },
        },
      });
    }

    // 3. 게시글이 하나도 없는 태그 정리
    await db.tag.deleteMany({
      where: {
        posts: { none: {} }, // ✅ 연결된 게시글이 없는 태그 제거
      },
    });
    return NextResponse.json({ ok: true, data: postResult });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json(
        { ok: false, error: e.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Unknown error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: NextRequest, { params }: { params: any }) => {
  const session = await getToken({ req, secret: process.env.SECRET });
  // if (!session)
  //   return NextResponse.json({
  //     ok: false,
  //     error: "로그인 인증이 필요합니다.",
  //   });

  const { id } = params;

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. 삭제할 post와 관련 태그들 가져오기
      const deletedPost = await tx.post.delete({
        where: { id: id },
        select: { id: true, tagsId: true, files: true },
      });

      const tags: Tag[] = [];
      // 2. 태그별로 postIds 갱신
      for (const tagId of deletedPost.tagsId) {
        const tag = await tx.tag.findUnique({ where: { id: tagId } });

        if (!tag) continue;

        const newPostIds = tag.postsId.filter((pid) => pid !== deletedPost.id);

        let removeTag;
        if (newPostIds.length === 0) {
          // 연결된 post 없으면 태그 삭제
          removeTag = await tx.tag.delete({ where: { id: tagId } });
        } else {
          // 남은 postIds 업데이트
          removeTag = await tx.tag.update({
            where: { id: tagId },
            data: { postsId: { set: newPostIds } },
          });
        }
        tags.push(removeTag);
      }
      return {
        deletedPost,
        tags,
      };
    });
    result.deletedPost.files.forEach((file) => {
      const { fileId, type } = file;
      let prefix = "images/v1";
      if (type == "video") {
        prefix = "stream";
      }

      fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT}/${prefix}/${fileId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${process.env.CF_TOKEN}`,
          },
        }
      ).catch((err) => console.error("삭제 실패:", err));
    });

    return NextResponse.json({
      ok: true,
      data: {
        post: result.deletedPost,
        tag: result.tags,
      },
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json(
        { ok: false, error: e.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Unknown error" },
      { status: 500 }
    );
  }
};
