"use client";
import { useTheme } from "next-themes";
import Dropdown from "../ui/dropdown";
import { MoonIcon, SunIcon, ArrowUpTrayIcon } from "@heroicons/react/20/solid";
import NormalBtn from "../ui/normalBtn";
import { createModal, createToast } from "@/hooks/useEvent";
import UploadModal from "../modal/uploadModal";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import {
  ArrowLeftStartOnRectangleIcon,
  ChatBubbleLeftEllipsisIcon,
  MapPinIcon,
  TagIcon,
} from "@heroicons/react/24/solid";
import { signOut, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

const hideFilter = ["viewer", "auth"];

const TopView = () => {
  const session = useSession();
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const {
    register,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const [placeHolderStr, setPlaceHolderStr] =
    useState<string>("태그를 입력해주세요.");
  const [inputValue, setInputValue] = useState<string | null>(
    params.get("s") ? params.get("s") : ""
  );
  const [initFilterData, setInitFilterData] = useState<string | null>(
    params.get("filter") ? params.get("filter") : "tag"
  );

  useEffect(() => {
    setInputValue(params.get("s"));
  }, [params]);

  return (
    <div
      className={`{
          ${
            hideFilter.some((page) => {
              return pathname.includes(page);
            })
              ? "block"
              : "block"
          }
        flex justify-between items-center px-2 
    h-[64px] border-b-[1px] dark:border-darkBorder-1 border-lightBorder-1`}
    >
      <div className="flex flex-1 gap-2 items-center pr-2">
        <Dropdown
          initStr={initFilterData}
          itemSize={{
            height: "h-[40px]",
            width: "sm:w-[60px] ti:w-[60px] md:w-[90px]",
          }}
          callback={(selectData) => {
            let str = "";
            switch (selectData) {
              case "tag":
                str = "태그";
                break;
              case "place":
                str = "장소";
                break;
              case "comment":
                str = "코멘트";
                break;
            }
            setPlaceHolderStr(`${str}를 입력해주세요.`);
            setInitFilterData(selectData);
            setInputValue("");
          }}
          itemAttr={[
            {
              entity: (
                <TagIcon
                  className="md:w-5 md:h-5 sm:w-4 sm:h-4 ti:w-4 ti:h-4"
                  title="tag"
                />
              ),
            },
            {
              entity: (
                <ChatBubbleLeftEllipsisIcon
                  className="md:w-5 md:h-5 sm:w-4 sm:h-4 ti:w-4 ti:h-4"
                  title="comment"
                />
              ),
            },
            {
              entity: (
                <MapPinIcon
                  className="md:w-5 md:h-5 sm:w-4 sm:h-4 ti:w-4 ti:h-4"
                  title="place"
                />
              ),
            },
          ]}
        />
        <div className="w-full">
          <div className="h-default w-full relative">
            <form
              className="w-full h-full"
              onSubmit={(e) => {
                const s = inputValue;
                if (!s || s.length <= 0) {
                  setError("searchInput", {
                    message: "검색어는 한글자 이상이여야 합니다.",
                  });
                  e.preventDefault();
                  return;
                }

                const filter = initFilterData;
                router.push(`/search/?s=${s}&filter=${filter}`);

                e.preventDefault();
              }}
            >
              <input
                {...register("searchInput", {
                  required: {
                    value: true,
                    message: "내용을 입력해주세요.",
                  },
                })}
                onChange={(e: any) => {
                  if (errors && errors?.searchInput?.message) {
                    clearErrors();
                  }
                  setInputValue(e.target.value);
                }}
                autoComplete="off"
                id="searchBarInput"
                className={`w-full md:text-lg sm:text-sm ti:text-sm
         h-full px-3 pr-10 rounded-lg focus:outline-none hover:!bg-transparent ${
           errors && errors?.searchInput?.message
             ? "animate-shake animate-infinite animate-duration-1000 animate-ease-in ring-2 ring-red-600 placeholder-red-600"
             : "dark:defaultBtnDark defaultBtnLight"
         }`}
                name="searchValue"
                value={inputValue ? inputValue : ""}
                placeholder={
                  errors && errors?.searchInput?.message
                    ? (errors?.searchInput?.message as string)
                    : placeHolderStr
                }
              />
              <button
                type="submit"
                className="justify-center absolute right-0 top-2 mr-4"
              >
                <MagnifyingGlassIcon
                  className={`w-5 h-5  ${
                    errors && errors?.searchInput?.message
                      ? "animate-shake animate-infinite animate-duration-1000 animate-ease-in"
                      : ""
                  }  `}
                />
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="flex gap-2 items-center justify-end ">
        <div className="h-default w-[60px] md:flex sm:hidden ti:hidden">
          <NormalBtn
            clickEvt={() => {
              createModal(<UploadModal />);
            }}
            entity={<ArrowUpTrayIcon className="w-5 h-5" />}
          />
        </div>
        <Dropdown
          itemSize={{
            height: "h-[40px]",
            width: "md:w-[60px] sm:w-[60px] ti:w-[60px]",
          }}
          initStr={theme == "null" ? "light" : theme}
          callback={(selectData) => {
            setTheme(selectData);
          }}
          itemAttr={[
            {
              entity: (
                <MoonIcon
                  className="md:w-5 md:h-5 sm:w-4 sm:h-4 ti:w-4 ti:h-4"
                  title="dark"
                />
              ),
            },
            {
              entity: (
                <SunIcon
                  className="md:w-5 md:h-5 sm:w-4 sm:h-4 ti:w-4 ti:h-4"
                  title="light"
                />
              ),
            },
          ]}
        />
        {session ? (
          <ArrowLeftStartOnRectangleIcon
            className="underline-offset-2 h-6 w-6 items-center flex cursor-pointer"
            onClick={() => {
              signOut();
            }}
          />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default TopView;
