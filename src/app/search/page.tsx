import { File, Post, Tag } from "@prisma/client";
import InfiniteScroll from "@/components/ui/infiniteScroll";
import ScrollViewWrapper from "@/components/ui/scrollViewWrapper";
import OptionView from "@/components/ui/optionView";

type PostType = Post & {
  _count: { files: number };
  files: File[];
  tags: Tag[];
};

interface ResponseProps {
  ok: boolean;
  data: PostType[];
}

const getData = async (
  searchStr: string,
  filter: string,
  pageParam: any
): Promise<ResponseProps> => {
  const qry = `/api/search?s=${searchStr}&filter=${filter}&offset=${pageParam}`;
  const result = await (await fetch(qry)).json();

  return result;
};

interface props {
  searchParams: { s: string; filter: string };
}
const SearchView = ({ searchParams }: props) => {
  const { filter, s } = searchParams;

  return (
    <ScrollViewWrapper>
      <OptionView />
      <InfiniteScroll
        type="multi"
        query={`/api/search?s=${s}&filter=${filter}`}
        queryKey={["search", s]}
        gcTime={1000}
      ></InfiniteScroll>
    </ScrollViewWrapper>
  );
};

export default SearchView;
