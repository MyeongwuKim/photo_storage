"use client";
import { useTheme } from "next-themes";
import Dropdown from "../ui/dropdown";
import { MoonIcon, SunIcon, ArrowUpTrayIcon } from "@heroicons/react/20/solid";
import NormalBtn from "../ui/normalBtn";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChatBubbleLeftEllipsisIcon,
  MapPinIcon,
  TagIcon,
} from "@heroicons/react/24/solid";
import { signIn, signOut, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useUI } from "../uiProvider";
import { Button } from "flowbite-react";
import { ToggleButton } from "../ui/toggleButton";
import TextInput from "../ui/textInput";

const hideFilter = ["viewer", "auth"];

const TopView = () => {
  const { data: session } = useSession();
  const { openModal } = useUI();
  const { setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();

  // ✅ RHF
  const {
    register,
    setError,
    clearErrors,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      searchInput: params.get("s") ?? "",
    },
  });

  // ✅ filter 상태를 URL 대신 state 로 관리
  const [filter, setFilter] = useState<"tag" | "comment" | "place">(
    (params.get("filter") as any) ?? "tag"
  );

  // ✅ placeholder 계산
  const inputPlaceHolder = useMemo(() => {
    switch (filter) {
      case "place":
        return "장소를 입력해주세요.";
      case "comment":
        return "코멘트를 입력해주세요.";
      default:
        return "태그를 입력해주세요.";
    }
  }, [filter]);

  // ✅ 현재 입력값
  const inputValue = watch("searchInput");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue || inputValue.length <= 0) {
      setError("searchInput", {
        message: "검색어는 한글자 이상이여야 합니다.",
      });
      return;
    }
    // ✅ 이 시점에서만 router.push
    router.push(`/search/?s=${inputValue}&filter=${filter}`);
  };

  return (
    <div
      className={`${
        hideFilter.some((page) => pathname.includes(page)) ? "hidden" : "flex"
      } justify-between items-center px-2 max-w-[768px] mx-auto h-[64px]`}
    >
      {/* ✅ 테마 토글 */}
      <ToggleButton
        className="w-[25px] h-[25px]"
        checkIcon={<MoonIcon className="w-[2rem] h-[2rem]" />}
        unCheckIcon={<SunIcon className="w-[2rem] h-[2rem]" />}
        clickCallback={(isChecked) => {
          setTheme(isChecked ? "light" : "dark");
        }}
        isCheck={resolvedTheme === "light"}
      />

      {/* ✅ 검색 영역 */}
      <div className="flex flex-1 gap-2 items-center pr-2">
        <Dropdown
          initStr={filter}
          itemSize={{ height: "h-[40px]", width: "w-[80px]" }}
          callback={(selectData) => {
            // ✅ 라우터 이동 X → state 만 변경
            setFilter(selectData as "tag" | "comment" | "place");
          }}
          itemAttr={[
            { entity: <TagIcon className="w-5 h-5" title="tag" /> },
            {
              entity: (
                <ChatBubbleLeftEllipsisIcon
                  className="w-5 h-5"
                  title="comment"
                />
              ),
            },
            { entity: <MapPinIcon className="w-5 h-5" title="place" /> },
          ]}
        />

        <form className="w-full h-full relative" onSubmit={onSubmit}>
          <TextInput
            className="h-[35px]"
            name="searchInput"
            value={inputValue}
            placeholder={errors?.searchInput?.message ?? inputPlaceHolder}
            id="searchBarInput"
            autoComplete="off"
            type="text"
            register={register}
            errors={errors}
            clearErrors={clearErrors}
            setValue={(v) => setValue("searchInput", v)}
          />
        </form>
      </div>

      {/* ✅ 버튼 영역 */}
      <div className="flex gap-2 items-center justify-end">
        {session && (
          <NormalBtn
            clickEvt={() => openModal("UPLOAD")}
            className="bg-blue-500 text-white hover:bg-blue-700 font-semibold h-[35px] w-[60px] md:flex sm:hidden ti:hidden"
            entity={<ArrowUpTrayIcon className="w-5 h-5" />}
          />
        )}

        <Button
          onClick={() => {
            session ? signOut() : signIn();
          }}
          color="light"
        >
          {session ? "로그아웃" : "로그인"}
        </Button>
      </div>
    </div>
  );
};

export default TopView;
