"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TabBtnProps {
  content: string;
  route: string;
  icon?: any;
  isDisabled: boolean;
  clickEvt?: () => void;
}

const TabBtn = ({
  content,
  route,
  isDisabled,
  icon,
  clickEvt,
}: TabBtnProps) => {
  return (
    <Link
      href={route}
      onClick={() => {
        //활성화 되어있던 라우트 저장
        if (clickEvt) clickEvt();
      }}
      className={`${
        isDisabled ? "cursor-none" : ""
      } me-2 inline-block pb-[6px]`}
    >
      <button
        disabled={isDisabled}
        className={`flex gap-2 items-center md:px-4 sm:px-2 ti:px-1 py-1  rounded-lg dark:defaultHoverDark defaultHoverLight ${
          isDisabled ? "!bg-transparent" : ""
        }`}
      >
        {icon ? icon : ""}
        {content}
      </button>
    </Link>
  );
};

export default TabBtn;
