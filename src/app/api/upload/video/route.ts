import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const session = await getToken({ req, secret: process.env.SECRET });
  if (!session)
    return NextResponse.json({
      ok: false,
      error: "로그인 인증이 필요합니다.",
    });

  try {
    let fetchUrl = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT}/stream/direct_upload `;
    const response = await (
      await fetch(fetchUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CF_VIDEO_TOKEN}`,
        },
        body: JSON.stringify({ maxDurationSeconds: 3600 }),
      })
    ).json();
    return NextResponse.json({
      ok: true,
      ...response.result,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      error: "비디오 서버와 통신중 오류가 발생하였습니다.",
    });
  }
};
