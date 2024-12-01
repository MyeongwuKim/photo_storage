import { db } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";

interface BodyProps {
  tags: string[];
}

export const DELETE = async (req: NextRequest) => {
  const session = await getToken({ req, secret: process.env.SECRET });
  if (!session)
    return NextResponse.json({
      ok: false,
      error: "로그인 인증이 필요합니다.",
    });

  const { tags } = (await req.json()) as BodyProps;

  const findTag = async (tag: string) => {
    return await db.tag.findUnique({
      where: {
        body: tag,
      },
      select: {
        posts: true,
      },
    });
  };
  try {
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      const tagData = await findTag(tag);
      if (tagData?.posts && tagData?.posts.length <= 0) {
        await db.tag.delete({
          where: {
            body: tag,
          },
        });
      }
    }
    return NextResponse.json({ ok: true });
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
