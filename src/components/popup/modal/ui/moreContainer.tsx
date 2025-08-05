"use client";
import { SetStateAction, useState } from "react";
import MoreView from "./moreView";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";

export const MoreContainer = ({
  slideNumber,
  uploadEvt,
}: {
  slideNumber: number;

  uploadEvt: (file: any) => void;
}) => {
  const [isMoreAcitve, setMoreAcitve] = useState<boolean>(false);

  return (
    <div className="flex flex-col items-end relative w-auto h-auto">
      <div className={`${isMoreAcitve ? "" : "hidden"}`}>
        <div
          onClick={() => setMoreAcitve(false)}
          id="morePannel"
          className="z-[-1] flex-none w-full h-full fixed top-0 left-0"
        />
        <MoreView slideNumber={slideNumber} uploadEvt={uploadEvt} />
      </div>
      <button
        onClick={() => setMoreAcitve(!isMoreAcitve)}
        id="moreBtn"
        className="relative mt-2 inline-flex h-8 w-8 items-center justify-center z-[1]
               rounded-full bg-white/30 hover:bg-white/50 focus:outline-none focus:ring-4
               focus:ring-white dark:bg-gray-800/30 dark:hover:bg-gray-800/60
                dark:focus:ring-gray-800/70 sm:h-10 sm:w-10"
      >
        <EllipsisVerticalIcon className="w-6 h-6" />
      </button>
    </div>
  );
};
