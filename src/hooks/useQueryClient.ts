import { cache } from "react";
import { QueryClient } from "@tanstack/query-core";

const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 300 * 1000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    })
);
export default getQueryClient;
