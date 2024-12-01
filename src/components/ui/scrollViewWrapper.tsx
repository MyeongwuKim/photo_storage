"use client";

import { useSearchParams } from "next/navigation";
import { ReactNode, useRef } from "react";

export const ScrollViewWrapper = ({ children }: { children: ReactNode }) => {
  const scrollViewRef = useRef<HTMLDivElement>(null);
  const params = useSearchParams();
  return (
    <div
      onScroll={(e) => {
        return false;
      }}
      id="infiniteScroll"
      ref={scrollViewRef}
      className={`absolute w-full outline-none ${
        params.size >= 2 && params.get("filter") && params.get("s")
          ? "h-[calc(100%-70px)]"
          : "top-[108px] h-[calc(100%-108px)]"
      }
         overflow-auto p-2 overflow-x-hidden`}
    >
      {children}
    </div>
  );
};

export default ScrollViewWrapper;
