"use client";
import TabBtn from "../ui/tabBtn";
import { usePathname, useParams } from "next/navigation";
import { setScrollValue } from "@/hooks/useUtil";

type TabViewItemType = { route: string; content: string; icon?: any };

interface TabViewProps {
  tabViewItems: TabViewItemType[];
}

const hideFilter = ["filter", "auth", "search"];
const TabView = ({ tabViewItems }: TabViewProps) => {
  const pathname = usePathname();
  const params = useParams();
  return (
    <div
      className={`
          ${
            hideFilter.some((page) => {
              return pathname.includes(page) || params[page];
            })
              ? "hidden"
              : "block"
          }
       bg-transparent
      h-default dark:border-darkBorder-1 border-lightBorder-1 border-b flex flex-wrap -mb-px px-4 mt-2 z-10`}
    >
      {tabViewItems.map((v, i) => (
        <div key={i}>
          <TabBtn
            icon={v.icon}
            isDisabled={v.route == pathname}
            content={v.content}
            route={v.route}
            clickEvt={() => {
              setScrollValue(pathname, "0");
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default TabView;
