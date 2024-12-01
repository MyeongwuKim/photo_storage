import ViewerComp from "@/components/ui/viewerComp";
import getQueryClient from "@/hooks/useQueryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata, NextPage } from "next";

type Props = {
  params: { id: string; filter: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { filter } = params;

  return {
    title: "Viewer | " + filter.charAt(0).toUpperCase() + filter.slice(1),
  };
}

const getData = async (id: string, filter: string | undefined) => {
  const url = `${process.env.NEXTAUTH_URL}/api/post/${id}${
    filter != "post" ? `?filter=${filter}` : ""
  }`;
  const result = await (await fetch(url, { cache: "no-store" })).json();
  return result;
};

const Viewer = async ({ params }: Props) => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [params.filter + "_" + params.id[0]],
    queryFn: () => getData(params.id[0], params.filter),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="w-full h-full">
        <div className="absolute w-full top-[64px] h-[calc(100%-64px)]  overflow-auto">
          <ViewerComp />
        </div>
      </div>
    </HydrationBoundary>
  );
};

export default Viewer;
