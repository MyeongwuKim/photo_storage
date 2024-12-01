"use client";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type SearchBarType = { placeholder: string; selectedDropItem: string };

const SearchBar = ({ placeholder, selectedDropItem }: SearchBarType) => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const [inputValue, setInputValue] = useState<string | null>(
    params.get("s") ? params.get("s") : ""
  );

  useEffect(() => {
    setInputValue("");
  }, [placeholder]);

  useEffect(() => {
    if (params.size <= 0) {
      router.replace(pathname);
    } else {
      router.replace(
        pathname + `?s=${inputValue}&filter=${selectedDropItem}`,
        {}
      );
    }
  }, [inputValue]);

  return (
    <div className="h-default w-full relative">
      <form onSubmit={() => {}}>
        <input
          autoComplete="off"
          id="searchBarInput"
          className="text-base dark:defaultBtnDark defaultBtnLight w-full
         h-full px-3 pr-10 rounded-lg focus:outline-none hover:!bg-transparent"
          name="searchBar_Input"
          value={inputValue ? inputValue : ""}
          placeholder={placeholder}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
        />
        <button
          type="submit"
          className="justify-center absolute right-0 top-2 mr-4"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
