import { db } from '@/lib/db';
import { getToken } from 'next-auth/jwt';
import { revalidatePath } from 'next/cache';
import { NextResponse, NextRequest } from 'next/server';

interface BodyProps {
   files: FileType[];
   info: InfoType;
}

export const POST = async (req: NextRequest) => {
   const session = await getToken({ req, secret: process.env.SECRET });
   if (!session)
      return NextResponse.json({
         ok: false,
         error: '로그인 인증이 필요합니다.',
      });

   const { files, info } = (await req.json()) as BodyProps;
   const { location, placeAddress } = info.mapData;
   const newFiles = files.map((v, i) => {
      let date = new Date();
      date.setMinutes(date.getMinutes() - i);
      v.createdAt = date;
      const newValue = {
         type: v.type,
         fileId: v.fileId,
         duration: 0,
         createdAt: date,
         width: v.width,
         height: v.height,
      };
      if (v.type == 'video') newValue.duration = v.duration!;
      return newValue;
   });
   try {
      let postReuslt = await db.post.create({
         data: {
            place: placeAddress,
            score: info.score,
            map: {
               lat: location.lat,
               lng: location.lng,
               placeAddress,
            },
            comment: info.comment,
            shootingDate: info.date,
            files: {
               createMany: {
                  data: newFiles,
               },
            },
         },
      });
      const createTag = async (body: string) => {
         await db.tag.upsert({
            create: {
               body,
               posts: {
                  connect: {
                     id: postReuslt.id,
                  },
               },
            },
            update: {
               posts: {
                  connect: {
                     id: postReuslt.id,
                  },
               },
            },
            where: {
               body,
            },
         });
      };
      for (let i = 0; i < info.tag.length; i++) {
         await createTag(info.tag[i]);
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

export const GET = async (req: NextRequest) => {
   try {
      const filter = req.nextUrl.searchParams.get('filter');
      const offset = req.nextUrl.searchParams.get('offset');
      const sort = req.nextUrl.searchParams.get('sort');
      const type = req.nextUrl.searchParams.get('type');
      const from = req.nextUrl.searchParams
         .get('from')
         ?.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
      const to = req.nextUrl.searchParams
         .get('to')
         ?.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
      let data;

      if (!filter) {
         let where = {};
         if (from || to) {
            where =
               type == 'shoot'
                  ? {
                       shootingDate: {
                          gte: from != null ? new Date(from!) : undefined,
                          lte: to != null ? new Date(to!) : undefined,
                       },
                    }
                  : {
                       createdAt: {
                          gte: from != null ? new Date(from!) : undefined,
                          lte: to != null ? new Date(to!) : undefined,
                       },
                    };
         }
         data = await db.post.findMany({
            skip: Number(offset) * 12,
            take: 12,
            where,
            select: {
               createdAt: true,
               id: true,
               _count: {
                  select: {
                     files: true,
                  },
               },
               files: {
                  take: 4,
                  select: {
                     thumbnail: true,
                     fileId: true,
                     type: true,
                  },
               },
               tags: {
                  select: { body: true },
               },
            },
            orderBy:
               type == 'shoot' && (from || to)
                  ? {
                       shootingDate:
                          sort == 'undefined' || !sort
                             ? 'desc'
                             : sort == 'new'
                             ? 'desc'
                             : 'asc',
                    }
                  : {
                       createdAt:
                          sort == 'undefined' || !sort
                             ? 'desc'
                             : sort == 'new'
                             ? 'desc'
                             : 'asc',
                    },
         });
      } else if (filter == 'tag') {
         const tag = req.nextUrl.searchParams.get('tag');
         const tagOffset = req.nextUrl.searchParams.get('tagOffset');
         const take = 10;
         const skip = take * (tagOffset ? Number(tagOffset) : 0);

         let where = tag ? { body: tag } : {};
         data = await db.tag.findMany({
            where,
            skip: Number(offset) * 4,
            take: 4,
            orderBy: {
               createdAt:
                  sort == 'undefined' || !sort
                     ? 'desc'
                     : sort == 'new'
                     ? 'desc'
                     : 'asc',
            },
            select: {
               body: true,
               id: true,
               posts: {
                  where: {
                     createdAt: {
                        gte: from != null ? new Date(from!) : undefined,
                        lte: to != null ? new Date(to!) : undefined,
                     },
                  },
                  take,
                  skip,
                  select: {
                     id: true,
                     files: true,
                     createdAt: true,
                     _count: {
                        select: {
                           files: true,
                        },
                     },
                  },
               },
            },
         });
      } else if (filter == 'fav') {
         data = await db.favorite.findMany({
            where: {
               createdAt: {
                  gte: from != null ? new Date(from!) : undefined,
                  lte: to != null ? new Date(to!) : undefined,
               },
            },
            skip: Number(offset) * 12,
            take: 12,
            select: {
               fileId: true,
               id: true,
               file: {
                  select: {
                     thumbnail: true,
                     type: true,
                     fileId: true,
                  },
               },
            },
            orderBy: {
               createdAt:
                  sort == 'undefined' || !sort
                     ? 'desc'
                     : sort == 'new'
                     ? 'desc'
                     : 'asc',
            },
         });
      } else {
         data = await db.file.findMany({
            skip: Number(offset) * 12,
            take: 12,
            where: {
               createdAt: {
                  gte: from != null ? new Date(from!) : undefined,
                  lte: to != null ? new Date(to!) : undefined,
               },
               type: {
                  contains: filter == 'photo' ? 'image' : 'video',
               },
            },
            select: {
               type: true,
               thumbnail: true,
               fileId: true,
               id: true,
            },
            orderBy: {
               createdAt:
                  sort == 'undefined' || !sort
                     ? 'desc'
                     : sort == 'new'
                     ? 'desc'
                     : 'asc',
            },
         });
      }
      if (!data) return NextResponse.json({ ok: false });

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
