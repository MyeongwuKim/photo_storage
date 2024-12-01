import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { placeId } = params;
  //maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Museum%20of%20Contemporary%20Art%20Australia&inputtype=textquery&fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry&key=YOUR_API_KEY
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address%2Cname%2Cgeometry&language=ko&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const data = await res.json();
  return NextResponse.json({ data });
}
