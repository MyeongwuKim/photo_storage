"use client";
import BoxItem from "@/components/ui/boxItem";
import { Tag, Post, File } from "@prisma/client";
import { ReactNode, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import CircleSpinner from "@/components/loading/circleSpinnder";
import ArrowBtnView from "./arrowBtnView";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import UploadModal from "../popup/modal/uploadModal";
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { getScrollValue, setScrollValue } from "@/hooks/useUtil";
import { useUI } from "../uiProvider";

type PostType = Post & {
  _count: { files: number };
  files: File[];
  tags: Tag[];
};

type TagType = Tag & {
  posts: {
    files: File[];
    id: string;
    createdAt: Date;
    _count: { files: number };
  }[];
};

type FavType = {
  fileId: string;
  id: string;
  file: { type: string; fileId: string };
};

type DateFilterType = {
  type: "create" | "shoot";
  from: string | null;
  to: string | null;
};

interface ResponseProps {
  ok: boolean;
  data: PostType[] | File[] | TagType[] | FavType[];
  error: string;
}

const getData = async (
  query: string,
  pageParam: any,
  pathname: string,
  sort: string,
  date: DateFilterType
): Promise<ResponseProps> => {
  const { from, to, type } = date;
  let qry = `${query}${
    pathname == "" ? "?" : "&"
  }offset=${pageParam}&sort=${sort}&type=${type}${
    from ? `&from=${from?.replace(/[.]/g, "")}` : ""
  }${to ? `&to=${to?.replace(/[.]/g, "")}` : ""}`;

  const result = await (await fetch(qry)).json();

  return result;
};

const getFilterText = (filter: string): string => {
  let filterText = "";
  switch (filter) {
    case "tag":
      filterText = "태그";
      break;
    case "comment":
      filterText = "코멘트";
      break;
    case "place":
      filterText = "장소";
      break;
  }
  return filterText;
};

const InfiniteScroll = ({
  type,
  query,
  queryKey,
  children,
  gcTime,
}: {
  type?: "multi" | "single";
  query: string;
  children?: ReactNode;
  queryKey: string[];
  gcTime?: number;
}) => {
  const route = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const { openModal, openToast } = useUI();
  const [ref, inView] = useInView({ threshold: 0.8 });
  const [item, setItem] = useState<PostType[] | File[] | TagType[] | FavType[]>(
    []
  );
  const [sort, setSort] = useState<string>(
    params.get("sort") == null ? "new" : params.get("sort")!
  );

  const [dateFilterData, setDateFilterData] = useState<DateFilterType>({
    from: !params.get("from") ? null : params.get("from")!,
    to: !params.get("to") ? null : params.get("to")!,
    type:
      params.get("type") == null
        ? "create"
        : (params.get("type") as "shoot" | "create"),
  });
  const [enableSpinnder, setEnableSpinnder] = useState<boolean>(false);
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<ResponseProps>({
    queryKey: queryKey,
    queryFn: ({ pageParam }) =>
      getData(
        query,
        pageParam,
        pathname.replace("/", ""),
        params.get("sort") == null ? "new" : params.get("sort")!,
        dateFilterData
      ),
    getNextPageParam: (lastPage, pages): number | undefined => {
      //undefined을 리턴하면 hasNextPage가 false가 됨
      const isMoreData = lastPage?.data?.length > 0 ? pages.length : undefined;
      return isMoreData;
    },
    initialPageParam: 0,
    gcTime,
  });

  useEffect(() => {
    // inView가 true 일때만 실행한다.
    if (!inView) return;
    const scrollViewRef = document.getElementById("infiniteScroll")!;
    const haveScrollbar =
      scrollViewRef.scrollHeight - scrollViewRef.clientHeight > 0
        ? true
        : false;

    if (inView && hasNextPage && haveScrollbar) {
      setScrollValue(pathname, scrollViewRef.scrollTop.toString());
      setEnableSpinnder(true);
      fetchNextPage().then(() => {
        setEnableSpinnder(false);
      });
    }
  }, [inView]);

  useEffect(() => {
    if (data) {
      let arr: PostType[] | File[] | TagType[] | FavType[] = [];
      for (let i = 0; i < data.pages.length; i++) {
        if (!data.pages[i].ok || !data) throw new Error(data.pages[i].error);

        if (data.pages[i].data.length > 0)
          arr = arr.concat(...data.pages[i].data) as
            | PostType[]
            | File[]
            | FavType[];
      }
      setItem(arr);
    }
  }, [data]);

  useEffect(() => {
    if (item && item?.length > 0) {
      document
        .getElementById("infiniteScroll")!
        .scrollTo({ top: getScrollValue(pathname) });
    }
  }, [item]);

  useEffect(() => {
    const sortParam = params.get("sort") == null ? "new" : params.get("sort")!;
    const newData = {
      ...dateFilterData,
      from: params.get("from"),
      to: params.get("to"),
      type:
        params.get("type") == null
          ? "create"
          : (params.get("type") as "create" | "shoot"),
    };
    setDateFilterData(newData);
    setSort(sortParam);
  }, [params]);

  useEffect(() => {
    if (params.size <= 0) return;
    refetch().then(() => {
      document.getElementById("infiniteScroll")!.scrollTo({ top: 0 });
      setScrollValue(pathname, "0");
    });
  }, [dateFilterData, sort]);

  if (isFetching && !isFetchingNextPage)
    return (
      <div
        id="SpinnerLoading"
        className={` p-4 absolute w-full top-[64px] h-[calc(100%-64px)]
       left-0 flex flex-col  items-center justify-center `}
      >
        <div className="rounded-md h-16 w-16 border-4 border-t-4 border-blue-500 animate-spin relative mb-4" />
      </div>
    );

  return (
    <>
      {pathname.replace("/", "") == "search" ? (
        <div className="flex justify-between relative md:text-2xl sm:text-xl ti:text-xl w-full h-auto font-semibold mb-4">
          <div>
            {params.get("filter") ? getFilterText(params.get("filter")!) : ""}{" "}
            <span className="underline">{params.get("s")}</span> 에 대한 검색
            결과
          </div>
          <XMarkIcon
            onClick={() => {
              route.back();
            }}
            className="w-6 h-6"
          />
        </div>
      ) : (
        ""
      )}
      <>
        {item?.length <= 0 ? (
          <div className="w-full mt-28 flex  justify-center flex-col items-center">
            <NoItemIcon />
          </div>
        ) : (
          <>
            {pathname.replace("/", "") == "tag" ? (
              <div>
                <div className="p-2 flex flex-col gap-2">
                  {(item as TagType[])?.map((v, i) => {
                    return <ArrowBtnView key={i} tagData={v} />;
                  })}
                </div>
              </div>
            ) : (
              <div className="relative gap-2 border-none  ti:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  grid">
                {item?.map((v, i) => {
                  return (
                    <div className="aspect-square" key={i}>
                      {type == "multi" ? (
                        <BoxItem
                          id={v.id}
                          multi={{
                            tags: (v as PostType).tags,
                            date: (v as PostType).createdAt,
                            files: (v as PostType).files,
                            filesCount: (v as PostType)._count.files,
                          }}
                        />
                      ) : (
                        <BoxItem
                          id={v.id}
                          single={{
                            fileId:
                              pathname.replace("/", "") == "favorite"
                                ? (v as FavType).file.fileId
                                : (v as File).fileId,
                            fileType:
                              pathname.replace("/", "") == "favorite"
                                ? (v as FavType).file.type
                                : "",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </>
      <div
        style={{ height: "84px" }}
        ref={ref}
        className={`w-full  flex justify-center items-center relative py-4 }`}
      >
        <CircleSpinner active={enableSpinnder} />
      </div>
      <div className="fixed bottom-4 right-4 h-[60px] w-[60px] md:hidden sm:visible z-10">
        <button
          className="w-full h-full flex justify-center items-center rounded-full  px-4 font-semibold blueBtn"
          onClick={() => openModal("UPLOAD")}
        >
          <ArrowUpTrayIcon className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};

export const NoItemIcon = () => {
  return (
    <>
      <div className="w-32 h-32">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.0"
          width="100%"
          height="100%"
          viewBox="0 0 512.000000 512.000000"
        >
          <g
            transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
            className="dark:fill-white fill-black"
            stroke="none"
          >
            <path d="M526 4340 c-99 -17 -179 -101 -196 -205 -12 -76 -13 -3114 -1 -3167 l9 -38 -145 0 c-139 0 -145 -1 -168 -25 -36 -35 -29 -89 14 -122 23 -18 4365 -19 4425 -1 54 16 138 99 153 153 24 84 504 2271 503 2295 -1 35 -36 109 -68 144 -15 16 -49 39 -77 52 -45 22 -63 24 -197 24 l-148 0 0 183 c0 100 -5 198 -10 218 -14 51 -76 118 -134 145 l-51 24 -963 0 c-833 0 -967 2 -992 15 -30 16 -35 24 -45 95 -14 87 -70 161 -150 197 -37 17 -94 18 -875 19 -459 1 -857 -2 -884 -6z m1721 -182 c12 -13 26 -48 32 -83 15 -80 55 -142 115 -180 l49 -30 990 -5 989 -5 24 -28 c23 -27 24 -33 24 -203 l0 -174 -1732 0 -1733 0 -51 -24 c-57 -27 -110 -84 -124 -136 -6 -19 -82 -361 -170 -760 -89 -399 -162 -729 -164 -735 -3 -5 -5 518 -5 1163 l-1 1173 25 24 24 25 844 0 844 0 20 -22z m2679 -891 c15 -13 26 -33 26 -48 0 -35 -481 -2209 -496 -2239 -6 -14 -23 -30 -36 -37 -20 -10 -426 -13 -1935 -12 -1050 1 -1921 4 -1934 8 -13 3 -33 19 -44 33 l-20 27 248 1118 c136 615 252 1126 257 1136 5 10 19 22 31 27 12 5 864 9 1949 9 l1927 1 27 -23z" />
            <path d="M2300 2629 c-112 -45 -138 -204 -44 -278 84 -66 207 -34 250 66 20 46 17 84 -9 133 -38 72 -126 107 -197 79z" />
            <path d="M3515 2626 c-106 -47 -132 -181 -51 -262 81 -81 216 -54 262 53 20 46 17 84 -9 133 -39 74 -130 108 -202 76z" />
            <path d="M2765 1965 c-124 -27 -221 -75 -292 -145 -33 -31 -43 -48 -43 -73 1 -39 17 -63 53 -76 33 -13 52 -6 95 31 175 150 501 154 686 7 31 -25 59 -39 78 -39 39 0 78 40 78 80 0 70 -175 184 -332 215 -93 18 -241 18 -323 0z" />
          </g>
        </svg>
      </div>
      <span className="text-lg font-semibold">여긴 너무 조용하네요..</span>
    </>
  );
};

export default InfiniteScroll;
