'use client';

import BoxItem from '@/components/ui/boxItem';
import { Tag, Post, File } from '@prisma/client';
import { startTransition, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import CircleSpinner from '@/components/loading/circleSpinnder';
import ArrowBtnView from './arrowBtnView';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { getScrollValue, setScrollValue } from '@/hooks/useUtil';
import { useUI } from '../uiProvider';
import NoItemIcon from '../icon/noItem';
import { useSession } from 'next-auth/react';
import { fetchPostsItem, fetchSearchPostsItem } from '@/lib/fetcher';

type DateFilterType = {
   type: 'create' | 'shoot';
   from: string | null;
   to: string | null;
};

// ✅ 필터 텍스트 매핑
const getFilterText = (filter: string): string =>
   (({ tag: '태그', comment: '코멘트', place: '장소' } as any)[filter] ?? '');

const InfiniteScroll = ({
   type,
   gcTime,
   postFilter,
   querykey,
}: {
   type?: 'multi' | 'single';
   gcTime?: number;
   postFilter: 'tag' | 'post' | 'photo' | 'video' | 'search' | 'fav';
   querykey: readonly unknown[];
}) => {
   const { data: session } = useSession();
   const route = useRouter();
   const params = useSearchParams();
   const pathname = usePathname();
   const { openModal } = useUI();
   const [ref, inView] = useInView({ threshold: 0.8 });

   const [enableSpinner, setEnableSpinner] = useState(false);

   const {
      data,
      fetchNextPage,
      hasNextPage,
      isFetching,
      isFetchingNextPage,
      refetch,
   } = useInfiniteQuery<
      InfidataResponse<PostType[] | File[] | TagType[] | FavType[]>, // TQueryFnData
      Error, // TError
      InfiniteData<
         InfidataResponse<PostType[] | File[] | TagType[] | FavType[]>
      >, // TData
      typeof querykey, // TQueryKey
      number
   >({
      queryKey: querykey,
      queryFn: ({ pageParam, queryKey }) => {
         const [_, key, vars] = queryKey as
            | ['', 'search', { s: string; filter: string }]
            | [
                 'tab',
                 'post',
                 {
                    sort: string;
                    type: string;
                    from: string | null;
                    to: string | null;
                 }
              ];

         if (key === 'search') {
            return fetchSearchPostsItem(vars.s, vars.filter, pageParam);
         }

         return fetchPostsItem(
            pageParam,
            vars.sort,
            {
               type: vars.type as 'create' | 'shoot',
               from: vars.from,
               to: vars.to,
            },
            postFilter === 'post' ? undefined : postFilter
         );
      },
      getNextPageParam: (lastPage, pages) =>
         lastPage?.data?.length > 0 ? pages.length : undefined,
      initialPageParam: 0,
      gcTime,
      placeholderData: (prev) => prev,
      refetchOnMount: false, // ✅ 클라에서 다시 안 불러옴
   });

   // ✅ 평탄화된 아이템

   const items = data?.pages
      .map((page) => {
         if (!page.ok) throw new Error(page.error);
         return page.data ?? [];
      })
      .flat() as (PostType | File | TagType | FavType)[];

   // ✅ inView → 다음 페이지 로드
   useEffect(() => {
      if (!inView || !hasNextPage) return;
      const scrollViewRef = document.getElementById('infiniteScroll')!;
      if (scrollViewRef.scrollHeight <= scrollViewRef.clientHeight) return;

      setEnableSpinner(true);
      fetchNextPage().finally(() => setEnableSpinner(false));
   }, [inView, hasNextPage]);

   // ✅ 필터/정렬 변경 시 → refetch + 스크롤 초기화
   useEffect(() => {
      if (params.size <= 0) return;

      document.getElementById('infiniteScroll')?.scrollTo({ top: 0 });
   }, []);

   // ✅ 로딩 상태
   if (isFetching && !isFetchingNextPage) {
      return (
         <div
            id="SpinnerLoading"
            className="p-4 absolute w-full top-[64px] h-[calc(100%-64px)] left-0 flex flex-col items-center justify-center"
         >
            <div className="rounded-md h-16 w-16 border-4 border-t-4 border-blue-500 animate-spin relative mb-4" />
         </div>
      );
   }

   return (
      <>
         {/* 검색 헤더 */}
         {pathname.replace('/', '') === 'search' && (
            <div className="mt-4 flex justify-between relative md:text-2xl sm:text-xl ti:text-xl w-full h-auto font-semibold mb-4">
               <div>
                  {params.get('filter')
                     ? getFilterText(params.get('filter')!)
                     : ''}{' '}
                  <span className="underline">{params.get('s')}</span> 에 대한
                  검색 결과
               </div>
               <XMarkIcon
                  onClick={() => startTransition(() => route.back())}
                  className="w-6 h-6 cursor-pointer"
               />
            </div>
         )}

         {/* 본문 아이템 */}
         {!items || items.length <= 0 ? (
            <div className="w-full mt-28 flex justify-center flex-col items-center">
               <NoItemIcon />
            </div>
         ) : pathname.replace('/', '') === 'tag' ? (
            <div className="p-2 flex flex-col gap-2">
               {(items as TagType[]).map((v, i) => (
                  <ArrowBtnView key={i} tagData={v} />
               ))}
            </div>
         ) : (
            <div className="relative gap-2 border-none grid ti:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
               {items.map((v, i) => {
                  return (
                     <div className="aspect-square" key={i}>
                        <BoxItem type={type} data={v} />
                     </div>
                  );
               })}
            </div>
         )}
         {/* 스크롤 옵저버 */}
         <div
            style={{ height: '84px' }}
            ref={ref}
            id="scrollObserver"
            className="w-full flex justify-center items-center relative py-4"
         >
            <CircleSpinner active={enableSpinner} />
         </div>
         {/* 업로드 버튼 */}
         {session && (
            <div className="fixed bottom-4 right-4 h-[60px] w-[60px] md:hidden sm:visible z-10">
               <button
                  className="w-full h-full flex justify-center items-center rounded-full px-4 font-semibold blueBtn"
                  onClick={() => openModal('UPLOAD')}
               >
                  <ArrowUpTrayIcon className="w-5 h-5" />
               </button>
            </div>
         )}
      </>
   );
};

export default InfiniteScroll;
