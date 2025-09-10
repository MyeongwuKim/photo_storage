"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/solid";
import { useCallback, useEffect, useState } from "react";
import TagItem from "./tagItem";
import Link from "next/link";
import Image from "next/image";
import { formateDate, getThumbnailURL } from "@/hooks/useUtil";
import { File, Tag } from "@prisma/client";
import BoxItem from "./boxItem";
import { useInfiniteQuery } from "@tanstack/react-query";

interface ResponseProps {
  ok: boolean;
  data: TagType[];
}

const getData = async (tag: string, pageParam: any): Promise<ResponseProps> => {
  const qry = `/api/post?filter=tag&tag=${tag}&tagOffset=${pageParam}`;
  const result = await (await fetch(qry)).json();
  return result;
};

/**클라이언트 단으로 분리한 Tag 페이지의 아이템*/
const ArrowBtnView = ({ tagData }: { tagData: TagType }) => {
  const [isScroll, setIsScoll] = useState<boolean>(false);
  const [vieweEnable, setViewEnable] = useState<boolean>(false);
  const [dirBtnEnable, setDirBtnEnable] = useState<{
    left: Boolean;
    right: Boolean;
  }>({ left: false, right: false });

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetching } =
    useInfiniteQuery<ResponseProps>({
      queryKey: [tagData.body],
      queryFn: ({ pageParam }) => getData(tagData.body, pageParam),
      getNextPageParam: (lastPage, pages): number | undefined => {
        //undefined을 리턴하면 hasNextPage가 false가 됨
        return lastPage.data[0].posts.length > 0 ? pages.length : undefined;
      },
      initialPageParam: 0,
      initialData: () => {
        return {
          pageParams: [0],
          pages: [{ ok: true, data: [tagData] }],
        };
      },
    });

  const updateDirBtn = () => {
    const scrollView = document.getElementById(
      tagData.body + "_tagScrollArea"
    )!;
    const possibleArea = scrollView?.scrollWidth! - scrollView?.clientWidth!; //스크롤 가능한 길이

    if (
      scrollView?.scrollLeft! > 0 &&
      Math.floor(possibleArea - scrollView?.scrollLeft) <= 0
    ) {
      setDirBtnEnable({ left: true, right: false });
    } else if (scrollView?.scrollLeft! <= 0 && possibleArea > 0) {
      setDirBtnEnable({ left: false, right: true });
    } else {
      setDirBtnEnable({ left: true, right: true });
    }
    setViewEnable(possibleArea > 0);
  };

  const scrollBtnEvt = (dir?: "right" | "left") => {
    if (hasNextPage) fetchNextPage();
    setIsScoll(true);
    let scrollView = document.getElementById(tagData.body + "_tagScrollArea");
    if (dir) {
      scrollView?.scrollBy({
        left:
          dir == "left" ? -scrollView?.clientWidth! : scrollView?.clientWidth!,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    document
      .getElementById(tagData.body + "_tagScrollArea")
      ?.addEventListener("scrollend", () => {
        setIsScoll(false);
        updateDirBtn();
      });
  }, []);

  useEffect(() => {
    updateDirBtn();
  }, [tagData.posts]);

  useEffect(() => {
    if (vieweEnable) {
      setIsScoll(false);
    }
  }, [vieweEnable]);

  return (
    <div className="flex flex-col gap-2">
      <div className="">
        <TagItem
          text={tagData.body}
          textsize={"md:text-[26px] sm:text-[22px] ti:text-[20px]"}
          readonly={true}
        />
      </div>
      <div
        id={tagData.body + "_tagScrollArea"}
        className="flex gap-2 flex-row h- w-full overflow-auto overflow-x-hidden duration-300 items-center"
      >
        {tagData.posts?.map((v, i) => {
          return (
            <div
              key={i}
              className="md:basis-[calc(20%-0.5rem)] sm:basis-[calc(33.34%-0.5rem)] ti:basis-[calc(50%-0.5rem)]
              aspect-square flex-none "
            >
              <BoxItem
                type={"multi"}
                data={{ ...v, tags: [] }}
                tagname={tagData.body}
              />
            </div>
          );
        })}
        <div
          id="scrollView"
          className={`flex items-center ${vieweEnable ? "visible" : "hidden"}`}
        >
          <button
            onClick={() => {
              if (isScroll) return;
              scrollBtnEvt("left");
            }}
            className={`${dirBtnEnable.left ? "visible" : "hidden"}
          absolute left-1 z-10 w-8 h-8 dark:bg-neutral-50 bg-gray-50 rounded-full flex items-center justify-center`}
          >
            <ChevronLeftIcon className="w-4 h-4 text-black pointer-events-none" />
          </button>
          <button
            onClick={() => {
              if (isScroll) return;
              scrollBtnEvt("right");
            }}
            className={`${dirBtnEnable.right ? "visible" : "hidden"}
          absolute right-1 z-10 w-8 h-8 dark:bg-neutral-50 bg-gray-50 rounded-full flex items-center justify-center`}
          >
            <ChevronRightIcon className="w-4 h-4  text-black pointer-events-none" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArrowBtnView;
