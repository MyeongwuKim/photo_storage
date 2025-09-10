"use client";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";
import Dropdown from "./dropdown";
import DatePicker from "./datePicker";
import { formateDate, formatSringDate } from "@/hooks/useUtil";
import { useCallback, useMemo, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import RadioComp from "./radioComp";
import { useUI } from "../uiProvider";

type DateFilterType = {
  type: string;
  from: string | null;
  to: string | null;
};

export const OptionView = () => {
  const params = useSearchParams();
  const route = useRouter();

  // ✅ sort만 별도 관리 (기본값 new)
  const sort = useMemo(() => params.get("sort") ?? "new", [params]);

  // ✅ 나머지 필터 값
  const dateFilterData = useMemo<DateFilterType>(() => {
    return {
      from: params.get("from"),
      to: params.get("to"),
      type: (params.get("type") as "shoot" | "create") ?? "create",
    };
  }, [params]);

  // ✅ sort 제외 나머지 파라미터 있으면 Drawer는 열린 상태
  const drawerOpen = useMemo(() => {
    return !!(params.get("from") || params.get("to") || params.get("type"));
  }, [params]);

  // ✅ 안정적인 쿼리스트링 빌더
  const createQueryString = useCallback(
    (querys: { name: string; value: string | null }[], isInit: boolean) => {
      const newParams = new URLSearchParams(isInit ? "" : params.toString());
      querys.forEach((q) => {
        if (q.value != null) newParams.set(q.name, q.value);
        else newParams.delete(q.name);
      });
      return newParams.toString();
    },
    [params.toString()]
  );

  return (
    <>
      <div className="w-full h-[40px] flex mb-2 gap-4 items-center px-2">
        <Dropdown
          itemSize={{
            height: "h-[40px]",
            width: "w-[100px]",
            textSize: "text-lg",
          }}
          initStr={sort}
          callback={(selectData) => {
            route.replace(
              "?" +
                createQueryString([{ name: "sort", value: selectData }], false)
            );
          }}
          itemAttr={[
            {
              entity: (
                <span className="text-lg" title="new">
                  최근
                </span>
              ),
            },
            {
              entity: (
                <span className="text-lg" title="old">
                  오래된
                </span>
              ),
            },
          ]}
        />
        <AdjustmentsHorizontalIcon
          className="w-6 h-6 cursor-pointer"
          onClick={() => {
            // 클릭 시 열려있으면 닫고, 닫혀있으면 강제로 열어줌
            const newParams = new URLSearchParams(params.toString());
            if (drawerOpen) {
              // 모든 필터 제거
              newParams.delete("from");
              newParams.delete("to");
              newParams.delete("type");
            } else {
              // 최소한 기본 type=create 넣어서 Drawer 열리게
              newParams.set("type", "create");
            }
            route.replace("?" + newParams.toString());
          }}
        />
      </div>

      <Drawer
        isActive={drawerOpen}
        dateState={dateFilterData}
        createQueryString={createQueryString}
      />
    </>
  );
};

export const Drawer = ({
  isActive,
  dateState,
  createQueryString,
}: {
  isActive: boolean;
  dateState: DateFilterType;
  createQueryString: (
    querys: { name: string; value: string | null }[],
    isInit: boolean
  ) => string;
}) => {
  const { openToast } = useUI();
  const route = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const changeEvt = useCallback(
    (data: DateFilterType | null, clear = false) => {
      const sort = params.get("sort") ?? "new";
      const s = params.get("s");

      const nextType = data?.type ?? "create"; // 기본값
      const currentType = params.get("type") ?? "create";

      // ✅ 값이 변하지 않으면 route.replace 안 함
      if (
        !clear &&
        nextType === currentType &&
        data?.from === params.get("from") &&
        data?.to === params.get("to")
      ) {
        return;
      }

      let mergeData: any = clear ? { sort, s } : { ...data, sort, s };
      const qrys = Object.entries(mergeData)
        .map(([name, value]) => ({
          name,
          value:
            name === "type"
              ? value
              : value
              ? value.toString().replace(/[.]/g, "")
              : null,
        }))
        .filter((q): q is { name: string; value: string } => !!q.value);

      const qryString = createQueryString(qrys, true);
      route.replace(qryString ? "?" + qryString : pathname);
    },
    [params.toString(), pathname, route, createQueryString]
  );

  return (
    <div
      className={`relative w-full ${
        isActive ? "h-[90px] max-sm:h-[140px]" : "h-0"
      } flex flex-col transition-all duration-500 overflow-hidden gap-3`}
    >
      <div className="flex items-center gap-3">
        <RadioComp
          disableSelect={
            pathname === "/" || pathname === "/favorite" ? null : "shoot"
          }
          dir="row"
          defaultSelect={dateState.type}
          groupname="date"
          items={[
            { selectValue: "create", name: "생성날짜" },
            { selectValue: "shoot", name: "촬영날짜" },
          ]}
          callback={(selectValue) =>
            changeEvt({ ...dateState, type: selectValue as string })
          }
        />

        <span
          onClick={() => changeEvt(null, true)} // ✅ Clear → 파라미터 초기화 + Drawer 닫힘
          className="text-red-600 font-semibold md:text-lg cursor-pointer"
        >
          Clear
        </span>
      </div>

      <div className="w-full max-w-[768px] flex max-sm:flex-col gap-3 items-center">
        <DatePicker
          defaultDate={
            dateState.from
              ? new Date(formatSringDate(dateState.from, "-"))
              : null
          }
          callback={(data) => {
            if (data) {
              const to = dateState.to?.replace(/[.]/g, "");
              const from = formateDate(data, "NOR").replace(/[.]/g, "");
              if (dateState.to && Number(from) > Number(to)) {
                openToast(true, "날짜값이 잘못되었습니다.", 1.5);
                return false;
              }
            }
            const from = data ? formateDate(data, "NOR") : null;
            changeEvt({ ...dateState, from });
            return true;
          }}
          addon={{ size: "w-[50px]", text: "From" }}
        />
        <span className="flex-none max-sm:hidden">~</span>
        <DatePicker
          defaultDate={
            dateState.to ? new Date(formatSringDate(dateState.to, "-")) : null
          }
          callback={(data) => {
            if (data) {
              const from = dateState.from?.replace(/[.]/g, "");
              const to = formateDate(data, "NOR").replace(/[.]/g, "");
              if (dateState.from && Number(from) > Number(to)) {
                openToast(true, "날짜값이 잘못되었습니다.", 1.5);
                return false;
              }
            }
            const to = data ? formateDate(data, "NOR") : null;
            changeEvt({ ...dateState, to });
            return true;
          }}
          addon={{ size: "w-[50px]", text: "To" }}
        />
      </div>
    </div>
  );
};

export default OptionView;
