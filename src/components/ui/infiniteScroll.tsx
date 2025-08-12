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
import NoItemIcon from "../icon/noItem";
import { useSession } from "next-auth/react";

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

interface ResponseProps extends GlobalResProps {
  data: PostType[] | File[] | TagType[] | FavType[];
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
  const { data: session, status } = useSession();
  const route = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const { openModal } = useUI();
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
      <div
        className={`${
          !session
            ? "hidden"
            : "fixed bottom-4 right-4 h-[60px] w-[60px] md:hidden sm:visible z-10"
        }`}
      >
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

export default InfiniteScroll;
