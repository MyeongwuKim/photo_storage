import { File, Post, Tag } from "@prisma/client";
import BoxItem from "@/components/ui/boxItem";
import InfiniteScroll from "@/components/ui/infiniteScroll";
import { HydrationBoundary, dehydrate, useQuery } from "@tanstack/react-query";
import getQueryClient from "@/hooks/useQueryClient";
import OptionView from "@/components/ui/optionView";
import ScrollViewWrapper from "@/components/ui/scrollViewWrapper";

type PostType = Post & {
  _count: { files: number };
  files: File[];
  tags: Tag[];
};

interface Props {
  searchParams: { sort: string };
}

const getData = async (pageParam: number, sort: string) => {
  const result = await (
    await fetch(
      `${process.env.NEXTAUTH_URL}/api/post?offset=${pageParam}&sort=${sort}`,
      {
        cache: "no-store",
      }
    )
  ).json();
  return result;
};

export default async function Home({ searchParams }: Props) {
  const queryKey = ["tab", "post"];
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => getData(pageParam, searchParams.sort),
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
          type="multi"
          query={`${process.env.NEXTAUTH_URL}/api/post`}
        />
      </ScrollViewWrapper>
    </HydrationBoundary>
  );
}
