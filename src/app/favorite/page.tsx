import InfiniteScroll from '@/components/ui/infiniteScroll';
import OptionView from '@/components/ui/optionView';
import ScrollViewWrapper from '@/components/ui/scrollViewWrapper';
import getQueryClient from '@/hooks/useQueryClient';
import { makePostQueryKey } from '@/hooks/useUtil';
import { DateFilterType, fetchPostsItem } from '@/lib/fetcher';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

interface Props {
   searchParams: { sort: string; type: string; to: string; from: string };
}

export default async function Favorite({ searchParams }: Props) {
   const sort = searchParams.sort ?? 'new';
   const dateFilterData: DateFilterType = {
      type: (searchParams.type as 'create' | 'shoot') ?? 'create',
      from: searchParams.from ?? null,
      to: searchParams.to ?? null,
   };
   const queryKey = makePostQueryKey(sort, dateFilterData, 'fav');

   const queryClient = getQueryClient();
   await queryClient.prefetchInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) =>
         fetchPostsItem(pageParam, sort, dateFilterData, 'fav'),
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
               type="single"
               postFilter={'fav'}
               querykey={queryKey}
            />
         </ScrollViewWrapper>
      </HydrationBoundary>
   );
}
