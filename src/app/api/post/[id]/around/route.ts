import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: { params: any }) => {
  const { id } = params;

  const filter = req.nextUrl.searchParams.get("filter");
  const tagName = req.nextUrl.searchParams.get("tagname");

  try {
    let aroundData = {};
    const getData = async (orderBy: "asc" | "desc") => {
      let data;
      if (!filter && !tagName) {
        data = await db.post.findMany({
          skip: 1,
          take: 1,
          cursor: {
            id,
          },
          select: {
            id: true,
          },
          orderBy: {
            createdAt: orderBy,
          },
        });
      } else if (tagName) {
        if (orderBy == "asc") orderBy = "desc";
        else orderBy = "asc";
        data = await db.tag.findUnique({
          where: {
            body: tagName,
          },
          select: {
            posts: {
              skip: 1,
              take: 1,
              cursor: {
                id,
              },
              select: {
                id: true,
              },
              orderBy: {
                createdAt: orderBy,
              },
            },
          },
        });
        return data?.posts[0] ? data?.posts[0].id : null;
      } else if (filter == "favorite") {
        data = await db.favorite.findMany({
          skip: 1,
          take: 1,
          cursor: {
            id,
          },
          select: {
            id: true,
            file: {
              select: {
                id: true,
                type: true,
              },
            },
          },
          orderBy: {
            createdAt: orderBy,
          },
        });
      } else {
        data = await db.file.findMany({
          skip: 1,
          take: 1,
          cursor: {
            id,
          },
          where: {
            type: {
              contains: filter == "photo" ? "image" : "video",
            },
          },
          select: {
            id: true,
          },
          orderBy: {
            createdAt: orderBy,
          },
        });
      }
      return data[0] ? data[0].id : null;
    };
    aroundData = {
      prev: await getData("asc"),
      next: await getData("desc"),
    };
    return NextResponse.json({ ok: true, data: aroundData });
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
