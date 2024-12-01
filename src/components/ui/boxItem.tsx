"use client";
import {
  formateDate,
  getImage,
  getThumbnailURL,
  setScrollValue,
} from "@/hooks/useUtil";
import {
  usePathname,
  useSearchParams,
  useSelectedLayoutSegment,
} from "next/navigation";
import { DocumentDuplicateIcon } from "@heroicons/react/24/solid";
import { File, Tag } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import VideoItem from "./videoItem";
import { useCallback } from "react";

type ItemType = {
  id: string;
  multi?: MultiType;
  single?: SingleType;
  url?: string;
};

type SingleType = { fileId: string; fileType?: string };
type MultiType = {
  filesCount?: number;
  files: File[];
  date: Date;
  tags?: Tag[];
  tagId?: string;
  tagBody?: string;
};

const BoxItem = (itemProps: ItemType) => {
  const pathname = usePathname().replace("/", "");
  const getViewerUrl = useCallback(
    (pathname: string, tagname: string | undefined) => {
      let url = `/viewer/${pathname.length <= 0 ? "post" : pathname}/${
        itemProps.id
      }`;
      return url + (tagname ? `/${tagname}` : "");
    },
    [itemProps]
  );

  return (
    <Link
      href={{
        pathname: itemProps.url
          ? itemProps.url
          : getViewerUrl(pathname, itemProps.multi?.tagBody),
      }}
      onClick={() => {
        const scrollTop = document.getElementById("infiniteScroll")?.scrollTop!;
        const name =
          pathname.replace("/", "").length <= 0
            ? "post"
            : pathname.replace("/", "");
        setScrollValue(name, scrollTop.toString());
      }}
      className={`${
        pathname == "tag" ? "flex-none w-[calc(20%-8px)]" : ""
      } relative w-full h-full  grid place-items-center overflow-hidden rounded-lg cursor-pointer p-2
      dark:border-darkBorder-1 border-lightBorder-1 border-2 hover:p-[0px] duration-300 transition-all`}
    >
      {itemProps.multi ? (
        <MultiItem props={itemProps.multi} />
      ) : (
        <SingleItem props={itemProps.single!} />
      )}
    </Link>
  );
};

const MultiItem = ({
  props: { date, files, tags, filesCount },
}: {
  props: MultiType;
}) => {
  const pathname = usePathname().replace("/", "");
  const getMargeTag = (tagData?: Tag[] | null): string => {
    if (!tagData) return "";
    let mergeTag = tagData?.map((v) => {
      return v.body;
    });

    return tagData ? mergeTag.join(",") : "";
  };
  return (
    <>
      <div className="flex w-full h-full gap-1">
        {files?.map((v, i) => (
          <div key={i} className="w-full h-full relative">
            <Image
              key={i}
              fill
              sizes="100%"
              priority
              className="relative rounded-lg object-cover "
              src={getThumbnailURL(v.type, v.fileId)}
              alt="Posts Thumbnail Image"
            />
          </div>
        ))}
      </div>
      <div className={`group absolute bottom-0 left-0 w-full h-full`}>
        <div
          className={`px-2 absolute transition delay-300 duration-300 ease-in-out 
            group-hover:bg-[rgba(0,0,0,0.4)] bg-[rgba(0,0,0,0)]
           flex flex-row bottom-0  justify-between w-full h-12`}
        >
          <div className="w-full h-full flex-row">
            <div
              className={`${
                pathname == "tag" ? "hidden" : "block"
              } text-lg font-semibold  transition delay-300 duration-300 ease-in-out 
                group-hover:text-darkText-2 text-[rgba(0,0,0,0)]`}
            >
              {getMargeTag(pathname == "tag" ? null : tags)}
            </div>
            <span
              className={`group-hover:text-[rgba(255,255,255,0.7)] text-[rgba(0,0,0,0)]
              text-base transition delay-300 duration-300 ease-in-out`}
            >
              {formateDate(date, "NOR")}
            </span>
          </div>
          <div
            className={`group-hover:text-darkText-2 text-[rgba(0,0,0,0)]
               flex items-center gap-1 h-5 transition delay-300 duration-300 ease-in-out`}
          >
            <DocumentDuplicateIcon className="w-5" />
            <span className="text-lg">{filesCount}</span>
          </div>
        </div>
      </div>
    </>
  );
};

const SingleItem = ({ props }: { props: SingleType }) => {
  const pathname = usePathname().replace("/", "");
  return (
    <div className=" relative w-full h-full">
      <div className="w-full h-full relative">
        {pathname == "photo" || props.fileType == "image" ? (
          <Image
            fill
            sizes="100%"
            priority
            className="relative rounded-xl object-cover"
            src={getImage("thumbnail", props?.fileId)}
            alt="Posts Thumbnail Image"
          />
        ) : (
          <VideoItem src={props.fileId} />
        )}
      </div>
    </div>
  );
};

export default BoxItem;
