// app/api/download/[id]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
   req: Request,
   { params }: { params: { id: string } }
) {
   const { id } = params;

   const imageUrl = `https://imagedelivery.net/0VaIqAONZ2vq2gejAGX7Sw/${id}/origin`;

   // ✅ 여기서 cache: "no-store" 옵션 추가!
   const res = await fetch(imageUrl, { cache: 'no-store' });

   if (!res.ok) {
      return NextResponse.json(
         { error: 'Cloudflare 응답 실패' },
         { status: 400 }
      );
   }

   const contentType =
      res.headers.get('content-type') || 'application/octet-stream';

   if (!contentType.startsWith('image/')) {
      return NextResponse.json(
         { error: '이미지가 아니라 HTML이 반환됨' },
         { status: 502 }
      );
   }

   const extension = contentType.split('/')[1] || 'bin';
   const buffer = await res.arrayBuffer();

   return new NextResponse(buffer, {
      headers: {
         'Content-Type': contentType,
         'Content-Disposition': `attachment; filename="${id}.${extension}"`,
      },
   });
}
