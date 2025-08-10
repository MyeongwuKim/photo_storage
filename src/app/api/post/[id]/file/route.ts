import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: { params: any }) => {
  const { id } = params;
  const filter = req.nextUrl.searchParams.get("filter");
  let data;
  try {
    if (!filter || filter == "tag" || filter == "search") {
      data = await db.post.findUnique({
        where: {
          id: id,
        },
        select: {
          files: true,
        },
      });
      data = data?.files;
    } else if (filter == "favorite") {
      data = await db.favorite.findUnique({
        where: {
          id,
        },
        select: {
          file: true,
        },
      });
      data = [data?.file];
    } else if (filter == "photo" || filter == "video") {
      data = await db.file.findUnique({
        where: {
          id,
        },
      });
      data = [data];
    }
    return NextResponse.json({ ok: true, data });
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
