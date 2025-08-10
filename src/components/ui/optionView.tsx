"use client";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";
import Dropdown from "./dropdown";
import DatePicker from "./datePicker";
import { formateDate, formatSringDate } from "@/hooks/useUtil";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import RadioComp from "./radioComp";
import { useUI } from "../uiProvider";

type DateFilterType = {
  type: "create" | "shoot";
  from: string | null;
  to: string | null;
};

export const OptionView = () => {
  const params = useSearchParams();
  const route = useRouter();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [sort, setSort] = useState<string>(
    params.get("sort") == null ? "new" : params.get("sort")!
  );
  const [dateFilterData, setDateFilterData] = useState<DateFilterType>({
    from: !params.get("from") ? null : params.get("from")!,
    to: !params.get("to") ? null : params.get("to")!,
    type:
      params.get("type") == null
        ? "create"
        : (params.get("type") as "shoot" | "create"),
  });

  useEffect(() => {
    const sortParam = params.get("sort") == null ? "new" : params.get("sort")!;
    if (params.get("to") || params.get("from") || params.get("type")) {
      setDrawerOpen(true);
    } else setDrawerOpen(false);
    const newData = {
      ...dateFilterData,
      from: params.get("from"),
      to: params.get("to"),
      type:
        params.get("type") == null
          ? "create"
          : (params.get("type") as "create" | "shoot"),
    };
    setDateFilterData(newData);
    setSort(sortParam);
  }, [params]);

  const createQueryString = useCallback(
    (querys: { name: string; value: string | null }[], isInit: boolean) => {
      const newParams = new URLSearchParams(isInit ? "" : params.toString());
      for (let i = 0; i < querys.length; i++) {
        const qry = querys[i];
        if (qry.value != null) newParams.set(qry.name, qry.value);
        // else newParams.delete('');
      }
      // newParams.append(name, value);

      return newParams.toString();
    },
    [params]
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
          initStr={params.get("sort") == null ? "new" : params.get("sort")!}
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
          className={`w-6 h-6 cursor-pointer`}
          onClick={() => setDrawerOpen((prev) => !prev)}
        />
      </div>
      <Drawer
        isActive={drawerOpen}
        stateAction={setDateFilterData}
        dateState={dateFilterData}
        createQueryString={createQueryString}
      />
    </>
  );
};

export const Drawer = ({
  isActive,
  stateAction,
  dateState,
  createQueryString,
}: {
  isActive: boolean;
  stateAction: Dispatch<SetStateAction<DateFilterType>>;
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
    (data: DateFilterType | null, isClear: boolean) => {
      const sort = params.get("sort");
      const s = params.get("s");
      const filter = params.get("filter");
      const mergeData = { ...data, sort, s, filter };
      let url = "";
      let qrys = [];

      for (let i = 0; i < Object.keys(mergeData).length; i++) {
        let name = Object.keys(mergeData)[i];
        let value =
          name == "type"
            ? Object.values(mergeData)[i]
            : Object.values(mergeData)[i]?.replace(/[.]/g, "");
        if (value) qrys.push({ name, value });
      }
      const qryString = createQueryString(qrys, true);
      url =
        qryString.replace(pathname, "").length > 0 ? "?" + qryString : pathname;
      route.push(url);
    },
    [dateState]
  );

  return (
    <div
      className={`relative w-full  ${
        isActive ? "h-[90px] max-sm:h-[140px]" : "h-0"
      }
        flex flex-col  transition-all duration-500  overflow-hidden gap-3`}
    >
      <div className="flex items-center gap-3">
        <RadioComp
          disableSelect={
            pathname == "/" || pathname == "/favorite" ? null : "shoot"
          }
          dir="row"
          defaultSelect={dateState.type}
          groupname="date"
          items={[
            { selectValue: "create", name: "생성날짜" },
            { selectValue: "shoot", name: "촬영날짜" },
          ]}
          callback={(selectValue: "create" | "shoot") => {
            changeEvt({ ...dateState, type: selectValue }, false);
          }}
        />

        <span
          onClick={() => {
            changeEvt(null, true);
          }}
          className="text-red-600 font-semibold  md:text-lg cursor-pointer"
        >
          Clear
        </span>
      </div>
      <div>
        <div className="md:w-[calc(80%-0px)] flex max-sm:flex-col gap-3  items-center">
          <DatePicker
            defaultDate={
              dateState.from
                ? new Date(formatSringDate(dateState.from, "-"))
                : null
            }
            callback={(data: Date | null) => {
              if (data) {
                const to = dateState.to?.replace(/[.]/g, "");
                const from = formateDate(data, "NOR").replace(/[.]/g, "");

                if (dateState.from && Number(from) > Number(to)) {
                  openToast(true, "날짜값이 잘못되었습니다.", 1.5);
                  return false;
                }
              }
              const from = data ? formateDate(data, "NOR") : null;
              changeEvt({ ...dateState, from }, false);
              return true;
            }}
            addon={{ size: "w-[50px]", text: "From" }}
          />
          <span className="flex-none max-sm:hidden">~</span>
          <DatePicker
            defaultDate={
              dateState.to ? new Date(formatSringDate(dateState.to, "-")) : null
            }
            callback={(data: Date | null) => {
              if (data) {
                const from = dateState.from?.replace(/[.]/g, "");
                const to = formateDate(data, "NOR").replace(/[.]/g, "");
                if (dateState.from && Number(from) > Number(to)) {
                  openToast(true, "날짜값이 잘못되었습니다.", 1.5);
                  return false;
                }
              }
              const to = data ? formateDate(data, "NOR") : null;
              changeEvt({ ...dateState, to }, false);
              return true;
            }}
            addon={{ size: "w-[50px]", text: "To" }}
          />
        </div>
      </div>
    </div>
  );
};

export default OptionView;
