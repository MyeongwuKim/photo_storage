"use client";
import TabBtn from "../ui/tabBtn";
import { usePathname, useParams } from "next/navigation";
import { setScrollValue } from "@/hooks/useUtil";
import { useSession } from "next-auth/react";
import { Button } from "flowbite-react";

type TabViewItemType = { route: string; content: string; icon?: any };

interface TabViewProps {
  tabViewItems: TabViewItemType[];
}

const hideFilter = ["filter", "auth", "search"];
const TabView = ({ tabViewItems }: TabViewProps) => {
  const { data: session, status } = useSession();
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
      h-default flex flex-wrap -mb-px px-4 mt-2 z-10 items-center justify-center gap-16`}
    >
      <div className="flex ">
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
    </div>
  );
};

export default TabView;
