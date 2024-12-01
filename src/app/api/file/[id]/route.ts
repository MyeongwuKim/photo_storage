import { db } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

interface BodyProps {
  fileId: string;
  isFav: boolean;
}

export const POST = async (req: NextRequest, { params }: { params: any }) => {
  const session = await getToken({ req, secret: process.env.SECRET });
  if (!session)
    return NextResponse.json({
      ok: false,
      error: "로그인 인증이 필요합니다.",
    });

  const { id } = params;
  const { isFav } = (await req.json()) as BodyProps;

  try {
    await db.file.update({
      where: {
        id,
      },
      data: {
        isFav,
      },
    });
    await db.favorite.create({
      data: {
        file: {
          connect: {
            id,
          },
        },
      },
    });
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

export const DELETE = async (req: NextRequest, { params }: { params: any }) => {
  const session = await getToken({ req, secret: process.env.SECRET });
  if (!session)
    return NextResponse.json({
      ok: false,
      error: "로그인 인증이 필요합니다.",
    });

  const { id } = params;
  const { isFav } = (await req.json()) as BodyProps;

  try {
    await db.file.update({
      where: {
        id,
      },
      data: {
        isFav,
      },
    });
    await db.favorite.delete({
      where: {
        fileId: id,
      },
    });
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
