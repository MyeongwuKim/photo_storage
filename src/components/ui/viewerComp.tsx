'use client';
import GMap from '@/components/google/gMap';
import StarRating from '@/components/ui/starRating';
import TagItem from '@/components/ui/tagItem';
import { carouselTheme } from '@/hooks/useFlowTheme';
import { formateDate, getImage } from '@/hooks/useUtil';
import {
   ArrowLeftIcon,
   PhotoIcon,
   ArrowRightIcon,
   ChevronRightIcon,
   ChevronLeftIcon,
   TrashIcon,
   PencilIcon,
   ArrowDownTrayIcon,
} from '@heroicons/react/24/solid';
import { File, Post, Tag } from '@prisma/client';
import { Carousel } from 'flowbite-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import StreamItem from './streamItem';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useUI } from '../uiProvider';
import { useSession } from 'next-auth/react';

type Variables = {
   fileId: string;
   isFav: boolean;
   method: 'POST' | 'DELETE';
};

interface PostResponse extends GlobalResProps {
   postData: Post & { tags: Tag[] };
}

interface AroundResponse extends GlobalResProps {
   data: {
      prev: string;
      next: string;
   };
}
const getPostUrl = (
   id: string,
   filter: string,
   tagname?: string | undefined
) => {
   return `/viewer/${filter}/${id}` + (tagname ? `/${tagname}` : '');
};
const getReturnUrl = (filter: string): string => {
   return `/${filter == 'post' ? '' : filter}`;
};

const fetchPostData = async (id: string, filter: string | undefined) => {
   const url = `/api/post/${id}${filter != 'post' ? `?filter=${filter}` : ''}`;
   const result = await (await fetch(url, { cache: 'no-store' })).json();
   return result;
};
const fetchAroundData = async (
   id: string,
   filter: string | undefined,
   tagname?: string | undefined
) => {
   let url = `/api/post/${id}/around?`;
   url += filter != 'post' ? `filter=${filter}` : '';
   url += tagname ? `&tagname=${tagname}` : '';

   const result = await (await fetch(url, { cache: 'no-store' })).json();
   return result;
};
const fetchFileData = async (id: string, filter: string | undefined) => {
   const url = `/api/post/${id}/file${
      filter != 'post' ? `?filter=${filter}` : ''
   }`;
   const result = await (await fetch(url, { cache: 'no-store' })).json();
   return result;
};

const ViewerComp = () => {
   const { openModal, openToast } = useUI();
   const { data: session, status } = useSession();
   const queryClient = useQueryClient();
   const { id, filter } = useParams<{ id: string[]; filter: string }>();
   const route = useRouter();

   const { data, isLoading, isFetching } = useQuery<PostResponse>({
      queryKey: [filter + '_' + id[0]],
      queryFn: () => fetchPostData(id[0], filter),
   });
   const { data: aroundData } = useQuery<AroundResponse>({
      queryKey: ['around' + '_' + id[0]],
      queryFn: () => fetchAroundData(id[0], filter, id[1]),
   });
   const { data: fileData, isLoading: fileLoading } = useQuery<
      GlobalResProps & { data: File[] }
   >({
      queryKey: ['file' + '_' + id[0]],
      queryFn: () => fetchFileData(id[0], filter),
   });
   //mutation
   const updatePost = useMutation<
      Response,
      Error,
      Variables,
      { prevData: GlobalResProps & { data: File[] } }
   >({
      mutationFn: async ({ fileId, isFav, method }) => {
         return await fetch(`/api/file/${fileId}`, {
            method,
            body: JSON.stringify({ isFav }),
         });
      },
      onSuccess: async (data) => {
         const result = await data.json();
         if (!result.ok) {
            openToast(true, result.error, 1.5);
         }
      },
      onError: (error, variables, context) => {
         if (context?.prevData) {
            queryClient.setQueryData(['file_' + id[0]], context.prevData); // 원상복구
         }
      },
      onSettled: () => {
         queryClient.invalidateQueries({ queryKey: ['file_' + id[0]] });
      },
      onMutate: ({ fileId }) => {
         const prevData = queryClient.getQueryData<
            GlobalResProps & { data: File[] }
         >(['file_' + id[0]]);

         if (!prevData) return;

         const newData = {
            ...prevData,
            data: prevData.data.map((file) =>
               file.id === fileId ? { ...file, isFav: !file.isFav } : file
            ),
         };
         queryClient.setQueryData(['file_' + id[0]], newData);
         return { prevData }; // rollback을 위해
      },
   });

   const deletePost = useMutation({
      mutationFn: async (id: string) =>
         await fetch(`/api/post/${id}`, {
            method: 'DELETE',
         }),
      onSuccess: async (data) => {
         const result = await data.json();
         if (result.ok) {
            openToast(false, '삭제 되었습니다.', 1.5);

            await queryClient.refetchQueries({
               queryKey: ['tab'],
            });

            route.replace('/');
         } else {
            openToast(true, result.error, 1.5);
         }
      },
   });

   //state
   const [slideNumber, setSlideNumber] = useState<number>(0);

   if (!data?.ok) {
      notFound();
   }
   return (
      <>
         <div className="z-0 relative w-full h-full overflow-auto ">
            <div className="h-0 absolute z-[2] w-full px-4 justify-between flex top-3">
               <div className="flex gap-2 w-auto relative">
                  <Link
                     href={getPostUrl(
                        aroundData?.data.prev ? aroundData?.data.prev : '',
                        filter,
                        id[1]
                     )}
                     className={`relative ${
                        !aroundData?.data.prev ? 'hidden' : ''
                     }
              flex items-center justify-center md:w-24 sm:w-20 ti:w-12 h-12  gap-2 px-4 py-2.5
              text-base  focus:outline-none cursor-pointer
              rounded-lg border b hover:border-gray-300 hover:text-gray-300
             focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700
             text-gray-400 border-gray-600`}
                  >
                     <ArrowLeftIcon id="leftBtn" className={`w-6 h-auto`} />
                  </Link>
                  <Link
                     shallow={true}
                     href={getReturnUrl(filter)}
                     className="flex items-center md:text-xl sm:text-lg ti:text-sm
            relative w-auto h-12 cursor-pointer text-darkText-1 font-semibold hover:underline"
                  >
                     <span className="">처음화면으로</span>
                  </Link>
               </div>
               <Link
                  href={getPostUrl(
                     aroundData?.data.next ? aroundData?.data.next : '',
                     filter,
                     id[1]
                  )}
                  className={`relative
              ${!aroundData?.data.next ? 'hidden' : ''}
              flex items-center justify-center md:w-24 sm:w-20 ti:w-12 h-12  gap-2 px-4 py-2.5
              text-base  focus:outline-none cursor-pointer
              rounded-lg border b hover:border-gray-300 hover:text-gray-300
             focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700
             text-gray-400 border-gray-600`}
               >
                  <ArrowRightIcon id="leftBtn" className={`w-6 h-auto`} />
               </Link>
            </div>
            {fileLoading ? (
               <FileSkeleton />
            ) : (
               <div className="relative w-full z-[1] aspect-square max-h-[calc(100%-70px)]">
                  <Carousel
                     id="viewerCarousel"
                     onSlideChange={(number) => {
                        if (!fileData?.data) return;
                        setSlideNumber(number);
                     }}
                     indicators={false}
                     theme={{
                        ...carouselTheme,
                        root: {
                           base: carouselTheme.root.base + ' bg-zinc-800',
                        },
                        item: {
                           base: 'absolute w-full h-full px-12 pt-20 pb-10',
                        },
                     }}
                     slide={false}
                     draggable={false}
                     leftControl={
                        <ChevronLeftIcon
                           className={`w-8 h-8 text-white ${
                              fileData?.data.length == 1 ? 'hidden' : ''
                           }`}
                        />
                     }
                     rightControl={
                        <ChevronRightIcon
                           className={`w-8 h-8 text-white ${
                              fileData?.data.length == 1 ? 'hidden' : ''
                           }`}
                        />
                     }
                  >
                     {fileData?.data?.map((v, i) => {
                        return (
                           <div
                              id="파일"
                              key={v.fileId}
                              className="flex justify-center"
                           >
                              {v.type == 'image' ? (
                                 <Image
                                    priority
                                    alt="image"
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className="relative h-full w-full object-contain"
                                    src={getImage('public', v.fileId)}
                                 />
                              ) : (
                                 <StreamItem
                                    index={i}
                                    slideNumber={slideNumber}
                                    fileId={v.fileId}
                                 />
                              )}
                              <div
                                 onClick={(e) => {
                                    const heartCheckbox =
                                       document.getElementById(
                                          `checkbox_${v.fileId}`
                                       );

                                    if (!v.isFav)
                                       heartCheckbox?.classList.add(
                                          'heartAnim'
                                       );
                                    else
                                       heartCheckbox?.classList.remove(
                                          'heartAnim'
                                       );

                                    updatePost.mutate({
                                       fileId: v.id,
                                       isFav: v.isFav ? false : true,
                                       method: v.isFav ? 'DELETE' : 'POST',
                                    });
                                    e.preventDefault();
                                 }}
                                 className={`${
                                    !session
                                       ? 'hidden'
                                       : 'md:w-10 h-auto sm:w-8 ti:w-6 flex-none absolute top-6 cursor-pointer'
                                 } `}
                              >
                                 <svg
                                    id="heartWrapper"
                                    fill="red"
                                    className={`absolute ${
                                       v.isFav ? 'z-10' : ''
                                    }`}
                                    viewBox="0 0 1024 1024"
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    p-id="2271"
                                 >
                                    <path
                                       d="M742.4 101.12A249.6 249.6 0 0 0 512 256a249.6 249.6 0 0 0-230.72-154.88C143.68 101.12 32 238.4 32 376.32c0 301.44 416 546.56 480 546.56s480-245.12 480-546.56c0-137.92-111.68-275.2-249.6-275.2z"
                                       fill="red"
                                       p-id="2272"
                                    />
                                 </svg>
                                 <label
                                    className="cursor-pointer"
                                    htmlFor="checkbox"
                                    id="heartLabel"
                                 >
                                    <input
                                       type="checkbox"
                                       id={`checkbox_${v.fileId}`}
                                       className={`hidden`}
                                    />
                                    <svg
                                       id="heartSvg"
                                       className="icon"
                                       viewBox="0 0 1024 1024"
                                       version="1.1"
                                       xmlns="http://www.w3.org/2000/svg"
                                       p-id="2271"
                                    >
                                       <path
                                          d="M742.4 101.12A249.6 249.6 0 0 0 512 256a249.6 249.6 0 0 0-230.72-154.88C143.68 101.12 32 238.4 32 376.32c0 301.44 416 546.56 480 546.56s480-245.12 480-546.56c0-137.92-111.68-275.2-249.6-275.2z"
                                          fill="#231F20"
                                          p-id="2272"
                                          id="heart"
                                       />
                                    </svg>
                                    <span
                                       id="heartSpan"
                                       className="w-[24px] h-[24px]"
                                    />
                                 </label>
                              </div>
                           </div>
                        );
                     })}
                  </Carousel>
                  <div
                     className={`absolute px-4 bottom-2 flex justify-between w-full`}
                  >
                     <div className="flex gap-2">
                        <Link
                           href={getPostUrl(
                              data?.postData?.id ? data?.postData?.id : '',
                              'post'
                           )}
                           className={`relative w-auto cursor-pointer  text-darkText-1 font-semibold hover:underline ${
                              filter == 'post' || filter == 'tag'
                                 ? `hidden`
                                 : ''
                           }`}
                        >
                           포스트 보기
                        </Link>
                     </div>
                     {/* 삭제,수정,다운로드 */}
                     <div className="flex gap-4">
                        {/* 삭제 버튼 */}
                        <TrashIcon
                           onClick={async () => {
                              const result = await openModal('ALERT', {
                                 msg: '삭제 하시겠습니까?',
                                 btnMsg: ['삭제', '취소'],
                                 title: '게시물 삭제',
                              });
                              if (result) {
                                 deletePost.mutate(data?.postData.id!);
                              }
                           }}
                           className={`
      w-8 h-8 cursor-pointer hover:border-gray-300 hover:text-gray-300 text-gray-400
      ${(session && filter === 'post') || filter === 'tag' ? '' : 'invisible'}
    `}
                        />

                        {/* 수정 버튼 */}
                        <PencilIcon
                           onClick={() => {
                              openModal('UPLOAD', {
                                 postId: filter + '_' + id[0],
                              });
                           }}
                           className={`
      w-8 h-8 cursor-pointer hover:border-gray-300 hover:text-gray-300 text-gray-400
      ${(session && filter === 'post') || filter === 'tag' ? '' : 'invisible'}
    `}
                        />

                        {/* 다운로드 버튼 */}
                        <ArrowDownTrayIcon
                           onClick={() => {
                              if (!fileData?.data[slideNumber]) return;

                              const { fileId } = fileData.data[slideNumber];

                              const link = document.createElement('a');
                              link.href = `/api/download/${fileId}`;
                              // 확장자는 서버에서 Content-Disposition 으로 내려줌
                              link.setAttribute('download', '');
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                           }}
                           className={`
    w-8 h-8 cursor-pointer hover:border-gray-300 hover:text-gray-300 text-gray-400
    ${
       session && fileData?.data[slideNumber].type === 'image'
          ? ''
          : 'invisible'
    }
  `}
                        />
                     </div>
                  </div>
               </div>
            )}
            {filter != 'post' ? (
               ''
            ) : (
               <ViwerBottom
                  loading={isLoading}
                  postData={data?.postData!}
                  tags={data?.postData.tags!}
               />
            )}
         </div>
      </>
   );
};

export const ViwerBottom = ({
   loading,
   postData,
   tags,
}: {
   loading: boolean;
   postData: Post;
   tags: Tag[];
}) => {
   return (
      <div className="relative flex mt-4 py-2 gap-4 justify-evenly flex-wrap">
         <div
            className="w-[480px] flex flex-col gap-2 p-6 bg-white border border-gray-200 h-full
               rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
         >
            {loading ? (
               <div role="status" className="max-w-sm animate-pulse">
                  <div className="h-5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
                  <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
               </div>
            ) : (
               <>
                  <div className="flex gap-2 text-lg ">
                     <span className="dark:text-darkText-2 text-lightText-2">
                        {formateDate(postData?.createdAt!, 'NOR')} 업로드
                     </span>
                     <span className="dark:text-darkText-1 text-lightText-1">
                        ({formateDate(postData?.shootingDate!, 'NOR')} 촬영)
                     </span>
                  </div>
                  <div>
                     {tags?.map((v, i) => (
                        <TagItem
                           key={i}
                           readonly={true}
                           text={v.body}
                           callback={() => {}}
                        />
                     ))}
                  </div>
                  <div className="flex gap-1 dark:text-darkText-2 text-lightText-2 items-center">
                     스코어:
                     <StarRating
                        defaultValue={postData?.score!}
                        readonly={true}
                     />
                  </div>
                  <pre className="dark:text-darkText-2 text-lightText-2">
                     {postData?.comment}
                  </pre>
               </>
            )}
         </div>
         <div className="w-[460px] flex gap-1 flex-col">
            <div
               className="block p-6 bg-white border border-gray-200 w-full h-full
               rounded-lg shadow  dark:bg-gray-800 dark:border-gray-700"
            >
               {loading ? (
                  <div role="status" className="max-w-sm animate-pulse">
                     <div className="h-5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                     <div className="h-[350px] bg-gray-200 rounded-lg dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
                  </div>
               ) : (
                  <>
                     <div
                        className={`text-lg dark:text-darkText-2 text-lightText-2`}
                     >
                        장소:
                        {postData?.map?.placeAddress.length! > 0
                           ? postData?.map?.placeAddress
                           : '정보없음'}
                     </div>
                     <div
                        className={`w-full h-[350px] relative mt-2 ${
                           postData?.map?.placeAddress.length! > 0
                              ? ''
                              : 'hidden'
                        }`}
                     >
                        <GMap
                           location={{
                              lat: postData?.map.lat!,
                              lng: postData?.map.lng!,
                           }}
                        />
                     </div>
                  </>
               )}
            </div>
         </div>
      </div>
   );
};

export const FileSkeleton = () => {
   return (
      <div className="relative h-full w-full bg-zinc-800">
         <div className="absolute w-full h-full px-16 pb-10 pt-20 flex items-center justify-center">
            <PhotoIcon className="animate-pulse h-full w-auto object-contain text-white" />
         </div>
      </div>
   );
};

export default ViewerComp;
