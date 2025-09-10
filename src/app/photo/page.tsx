import InfiniteScroll from '@/components/ui/infiniteScroll';
import OptionView from '@/components/ui/optionView';
import ScrollViewWrapper from '@/components/ui/scrollViewWrapper';
import { makePostQueryKey } from '@/hooks/useUtil';
import { DateFilterType } from '@/lib/fetcher';

interface Props {
   searchParams: { sort: string; type: string; to: string; from: string };
}

export default async function Photo({ searchParams }: Props) {
   const sort = searchParams.sort ?? 'new';
   const dateFilterData: DateFilterType = {
      type: (searchParams.type as 'create' | 'shoot') ?? 'create',
      from: searchParams.from ?? null,
      to: searchParams.to ?? null,
   };
   const queryKey = makePostQueryKey(
      searchParams.sort ?? 'new',
      dateFilterData,
      'photo'
   );

   return (
      <ScrollViewWrapper>
         <OptionView />
         <InfiniteScroll postFilter="photo" type="single" querykey={queryKey} />
      </ScrollViewWrapper>
   );
}
