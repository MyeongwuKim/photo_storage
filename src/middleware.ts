import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname, origin, href } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.SECRET });
  console.log(request.method);
  if (
    (request.method === "POST" || request.method === "DELETE") &&
    !token &&
    !pathname.startsWith("/api/auth") // auth API 예외 처리
  ) {
    return NextResponse.json(
      { error: "API 접근 권한이 없습니다." },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*", // API 요청도 검사
    "/((?!_next/static|_next/image|favicon.ico|auth/signin).*)", // 나머지 페이지
  ],
};
