"use client";
import {
  formateDate,
  getImage,
  getThumbnailURL,
  setScrollValue,
} from "@/hooks/useUtil";
import { usePathname } from "next/navigation";
import { DocumentDuplicateIcon } from "@heroicons/react/24/solid";
import { File, Tag } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import VideoItem from "./videoItem";
import { useCallback } from "react";

type BoxItemProps = {
  type?: "multi" | "single";
  data: PostType | File | TagType | FavType;
  tagname?: string; // ✅ 추가
};

const BoxItem = ({ type, data, tagname }: BoxItemProps) => {
  const pathname = usePathname().replace("/", "");

  const getViewerUrl = useCallback(() => {
    const base = pathname.length <= 0 ? "post" : pathname;
    return `/viewer/${base}/${(data as any).id}${tagname ? `/${tagname}` : ""}`;
  }, [pathname, data, tagname]);

  const handleSaveScroll = () => {
    const scrollTop = document.getElementById("infiniteScroll")?.scrollTop || 0;
    const name = pathname.length <= 0 ? "post" : pathname;
    setScrollValue(name, scrollTop.toString());
  };

  return (
    <Link
      href={{ pathname: getViewerUrl() }}
      onClick={handleSaveScroll}
      className={`${
        pathname === "tag" ? "flex-none w-[calc(20%-8px)]" : ""
      } relative w-full h-full grid place-items-center overflow-hidden rounded-lg cursor-pointer p-2
        dark:border-darkBorder-1 border-lightBorder-1 border-2 hover:p-[0px] duration-300 transition-all`}
    >
      {type === "multi" ? (
        <RenderMulti
          date={(data as PostType).createdAt}
          files={(data as PostType).files}
          tags={(data as PostType).tags}
          filesCount={(data as PostType)._count.files}
        />
      ) : (
        <RenderSingle
          fileId={
            pathname === "favorite"
              ? (data as FavType).file.fileId
              : (data as File).fileId
          }
          fileType={
            pathname === "favorite"
              ? (data as FavType).file.type
              : (data as File).type
          }
          thumbnail={
            pathname === "favorite"
              ? (data as FavType).file.thumbnail ?? null
              : (data as File).thumbnail
          }
        />
      )}
    </Link>
  );
};

export default BoxItem;

//
// === Multi 렌더러 ===
//
const RenderMulti = ({
  date,
  files,
  tags,
  filesCount,
}: {
  date: Date;
  files: File[];
  tags?: Tag[];
  filesCount?: number;
}) => {
  const pathname = usePathname().replace("/", "");
  const mergeTags = tags?.map((t) => t.body).join(",") ?? "";

  return (
    <>
      <div className="flex w-full h-full gap-1">
        {files.map((v, i) => (
          <div key={i} className="w-full h-full relative">
            <Image
              fill
              sizes="100%"
              priority
              className="rounded-lg object-cover"
              src={
                process.env.NEXT_PUBLIC_DEMO && v.type === "video"
                  ? v.thumbnail!
                  : getThumbnailURL(v.type, v.fileId)
              }
              alt="Posts Thumbnail Image"
            />
          </div>
        ))}
      </div>
      <div className="group absolute bottom-0 left-0 w-full h-full">
        <div
          className="px-2 absolute transition delay-300 duration-300 ease-in-out 
            group-hover:bg-[rgba(0,0,0,0.4)] bg-transparent
            flex flex-row bottom-0 justify-between w-full h-12"
        >
          <div className="w-full h-full flex-row">
            {pathname !== "tag" && (
              <div
                className="text-lg font-semibold transition delay-300 duration-300 ease-in-out 
                  group-hover:text-darkText-2 text-transparent"
              >
                {mergeTags}
              </div>
            )}
            <span
              className="group-hover:text-[rgba(255,255,255,0.7)] text-transparent
                text-base transition delay-300 duration-300 ease-in-out"
            >
              {formateDate(date, "NOR")}
            </span>
          </div>
          <div
            className="group-hover:text-darkText-2 text-transparent
              flex items-center gap-1 h-5 transition delay-300 duration-300 ease-in-out"
          >
            <DocumentDuplicateIcon className="w-5" />
            <span className="text-lg">{filesCount}</span>
          </div>
        </div>
      </div>
    </>
  );
};

//
// === Single 렌더러 ===
//
const RenderSingle = ({
  fileId,
  fileType,
  thumbnail,
}: {
  fileId: string;
  fileType?: string;
  thumbnail: string | null;
}) => {
  const isImage = fileType === "image";

  return (
    <div className="relative w-full h-full">
      {isImage ? (
        <Image
          fill
          sizes="100%"
          priority
          className="rounded-xl object-cover"
          src={getImage("thumbnail", fileId)}
          alt="Posts Thumbnail Image"
        />
      ) : (
        <VideoItem src={fileId} thumbnail={thumbnail} />
      )}
    </div>
  );
};
