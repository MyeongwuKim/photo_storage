"use client";

type LoadingType = {
  msg?: string;
};

const GlobalLoading = ({ msg }: LoadingType) => {
  return (
    <div
      id="SpinnerLoading"
      className={`
      fixed z-[99] top-0 left-0 flex flex-col  items-center justify-center w-full h-full bg-[rgba(0,0,0,0.5)]`}
    >
      <div className="rounded-md h-16 w-16 border-4 border-t-4 border-blue-500 animate-spin relative mb-4"></div>
      <div className="dark:text-darkText-2 text-lightText-2 text-xl font-bold">
        {msg}
      </div>
    </div>
  );
};

export default GlobalLoading;
