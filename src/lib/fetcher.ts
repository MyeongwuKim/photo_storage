import { File } from "@prisma/client";

export interface DateFilterType {
  type: "create" | "shoot";
  from: string | null;
  to: string | null;
}

export const fetchPostsItem = async (
  pageParam: number,
  sort: string,
  date: DateFilterType,
  filter?: string // ✅ filter 추가 (없을 수도 있음)
): Promise<InfidataResponse<PostType[] | File[] | TagType[] | FavType[]>> => {
  const { from, to, type } = date;

  const query = new URLSearchParams({
    offset: String(pageParam),
    sort,
    type,
  });

  if (from) query.set("from", from.replace(/[.]/g, ""));
  if (to) query.set("to", to.replace(/[.]/g, ""));
  if (filter) query.set("filter", filter); // ✅ filter 있으면만 추가

  const baseUrl = process.env.NEXTAUTH_URL ?? "";
  const url = `${baseUrl}/api/post?${query.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Fetch failed with status ${res.status}`);
  }

  const jsonData = await res.json();
  return jsonData;
};

export const fetchSearchPostsItem = async (
  searchStr: string,
  filter: string,
  pageParam: any
): Promise<InfidataResponse<PostType[]>> => {
  const url = `/api/search?s=${searchStr}&filter=${filter}&offset=${pageParam}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Fetch failed with status ${res.status}`);
  }

  const jsonData = await res.json();

  return jsonData;
};
