"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import getQueryClient from "@/hooks/useQueryClient";

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();
  useEffect(() => {
    //스크롤값 초기화
    const theme = window.localStorage.getItem("theme");
    window.localStorage.clear();
    window.localStorage.setItem("theme", theme!);
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>{children}</ReactQueryStreamedHydration>
      {process.env.NODE_ENV == "development" ? (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      ) : (
        ""
      )}
    </QueryClientProvider>
  );
};
