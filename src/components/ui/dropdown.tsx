"use client";
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type itemAttrType = { entity: any };
interface DropdownProps {
  itemAttr: itemAttrType[];
  itemSize: { height: string; width: string; textSize?: string };
  initStr?: string | null;
  callback?: (data?: any) => void;
}
export default function Dropdown({
  itemAttr,
  itemSize,
  callback,
  initStr,
}: DropdownProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  //initStr이 있다면 일치하는 문자를 찾아 select해준다
  useEffect(() => {
    if (initStr) {
      for (let i = 0; i < itemAttr.length; i++) {
        if (itemAttr[i].entity.props.title == initStr) {
          setSelectedIdx(i);
          break;
        }
      }
    }
  }, [initStr]);

  return (
    <Menu
      as="div"
      className={`relative inline-block text-left ${itemSize.width}`}
    >
      <div>
        <Menu.Button
          className={`inline-flex w-full justify-center  gap-x-1.5 rounded-md ${itemSize.textSize}
          px-3 ring-inset items-center flex-1  ${itemSize.height} ${itemSize.width}`}
        >
          {itemAttr[selectedIdx].entity}
          <ChevronDownIcon
            className="w-4 h-4 flex-none text-gray-400 "
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`z-50 absolute right-0 mt-2 origin-top-right rounded-md 
           shadow-lg ring-1 ring-lightBorder-1 dark:ring-darkBorder-1
          focus:outline-none bg-white dark:bg-[rgb(18,18,18)] ${itemSize.width}`}
        >
          <div className="">
            {itemAttr.map((v, i) => {
              return (
                <Menu.Item key={i}>
                  {({ active, close }) => (
                    <button
                      onClick={() => {
                        setSelectedIdx(i);
                        if (callback) callback(itemAttr[i].entity.props.title);
                      }}
                      className={classNames(
                        `dark:hover:bg-darkBtn-1 hover:bg-lightBtn-1  w-full px-4 flex justify-center items-center ${itemSize.height}`
                      )}
                    >
                      {v.entity}
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
