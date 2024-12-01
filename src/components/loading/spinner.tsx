"use client";
import { registerLoadingState } from "@/hooks/useEvent";
import { useEffect, useState } from "react";

const Spinner = () => {
  const [isActive, setActive] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    if (!isActive) setMsg("");
  }, [isActive]);
  registerLoadingState(setActive, setMsg);

  return (
    <div
      id="SpinnerLoading"
      className={`${isActive ? "" : "hidden"}
      fixed z-[99] top-0 left-0 flex flex-col  items-center justify-center w-full h-full bg-[rgba(0,0,0,0.5)]`}
    >
      <div className="rounded-md h-16 w-16 border-4 border-t-4 border-blue-500 animate-spin relative mb-4"></div>
      <div className="dark:text-darkText-2 text-lightText-2 text-lg font-semibold">
        {msg}
      </div>
    </div>
  );
};

export default Spinner;
