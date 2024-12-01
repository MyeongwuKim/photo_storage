import InfiniteScroll from "@/components/ui/infiniteScroll";
import OptionView from "@/components/ui/optionView";
import ScrollViewWrapper from "@/components/ui/scrollViewWrapper";
import getQueryClient from "@/hooks/useQueryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

const getData = async (pageParam: number) => {
  const result = await (
    await fetch(
      `${process.env.NEXTAUTH_URL}/api/post?filter=fav&offset=${pageParam}`,
      { cache: "no-store" }
    )
  ).json();
  return result;
};

export default async function Favorite() {
  const queryKey = ["tab", "fav"];
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => getData(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      return pages.length;
    },
    pages: 0,
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ScrollViewWrapper>
        <OptionView />
        <InfiniteScroll
          queryKey={queryKey}
          type="single"
          query={`${process.env.NEXTAUTH_URL}/api/post?filter=fav`}
        />
      </ScrollViewWrapper>
    </HydrationBoundary>
  );
}
