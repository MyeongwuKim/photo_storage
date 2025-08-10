import { db } from "@/lib/db";
import { error } from "console";
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

export const DELETE = async (req: NextRequest, { params }: { params: any }) => {
  const session = await getToken({ req, secret: process.env.SECRET });
  if (!session)
    return NextResponse.json({
      ok: false,
      error: "로그인 인증이 필요합니다.",
    });

  const { id } = params;

  try {
    const tagData = await db.post.findUnique({
      where: {
        id,
      },
      select: {
        tags: {
          select: {
            body: true,
          },
        },
      },
    });
    const body = tagData?.tags.map((v) => {
      return v.body;
    });
    await db.post.update({
      where: {
        id,
      },
      data: {
        tags: { set: [] },
      },
    });
    await db.post.delete({
      where: {
        id,
      },
      select: {
        tags: {},
      },
    });
    return NextResponse.json({ ok: true, tags: body });
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
