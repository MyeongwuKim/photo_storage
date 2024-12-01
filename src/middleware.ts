import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname, origin, href } = request.nextUrl;
  const session = await getToken({ req: request, secret: process.env.SECRET });
  if (!session)
    return NextResponse.redirect(new URL("/auth/signin", request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth/signin).*)"],
};
