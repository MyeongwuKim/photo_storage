import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const filter = req.nextUrl.searchParams.get("filter") as string;
  const s = req.nextUrl.searchParams.get("s");
  const offset = req.nextUrl.searchParams.get("offset");
  try {
    if (filter == "undefined" || s == "undefined") {
      return NextResponse.json(
        {
          ok: false,
          error: "적절하지 못한 파라미터.",
        },
        { status: 404 }
      );
    }

    let data;
    const take = 12;

    if (filter == "tag") {
      data = await db.post.findMany({
        skip: Number(offset) * take,
        take,
        where: {
          tags: {
            some: { body: { contains: s! } },
          },
        },
        include: {
          files: true,
          _count: {
            select: {
              files: true,
            },
          },
        },
      });
    } else if (filter == "comment") {
      data = await db.post.findMany({
        skip: Number(offset) * take,
        take,
        where: {
          comment: { contains: s! },
        },
        include: {
          files: true,
          _count: {
            select: {
              files: true,
            },
          },
        },
      });
    } else {
      data = await db.post.findMany({
        skip: Number(offset) * take,
        take,
        where: {
          place: { contains: s! },
        },
        include: {
          files: true,
          _count: {
            select: {
              files: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (e: any) {
    let error = e?.code
      ? `Prisma errorCode:${e.code}, Prisma Error ${JSON.stringify(e.meta)}`
      : `다시 시도해주세요.`;

    return NextResponse.json(
      {
        ok: false,
        error,
      },
      { status: 404 }
    );
  }
};
