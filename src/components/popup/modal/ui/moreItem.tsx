"use client";
import { getFormatTranslateX } from "@/hooks/useUtil";
import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

let isItemClick = false;
let isMoveDone = false;
let shiftX = 0;
let originX = 0;
let itemIndex = -1;

const getSelectItemEle = (itemIndex: number): HTMLElement => {
  return document.getElementById(`moreview_item${itemIndex}`)
    ?.children[0] as HTMLElement;
};
type ItemType = {
  url: string;
  itemWidth: number;
  index: number;
  slideNumber: number;
};
export const MoreItem = ({
  itemAttr,
  callback,
  moveItem,
  maxLength,
}: {
  itemAttr: ItemType;
  callback: () => void;
  moveItem: (selectIndex: number, toIndex: number) => void;
  maxLength: number;
}) => {
  /** 파일 스왑이 일어났을때 현재 선택한 아이템 빼고 초기 위치 세팅
    이 처리를 해주지않으면 선택한 아이템이 초기포지션으로 이동했다가 다시돌아오기 때문에 해줘야한다*/
  useEffect(() => {
    const selectItemEle = document.getElementById(
      `moreview_item${itemAttr.index}`
    )?.children[0] as HTMLElement;

    if (itemAttr.index == itemIndex) {
      const ele = document.getElementsByClassName("_indicators")[0].children[
        itemIndex
      ] as any;
      ele.click();
    } else {
      selectItemEle.style.transform = `translateX(${
        itemAttr.index * itemAttr.itemWidth
      }px)`;
    }
  }, [itemAttr]);

  const itemMoveEvt = (e: any) => {
    if (itemIndex != -1 && isItemClick) {
      isMoveDone = false;
      getSelectItemEle(itemIndex).style.transform = `translateX(${
        e.clientX - shiftX
      }px)`;
      const dir =
        Number(((e.clientX - shiftX) / itemAttr.itemWidth).toFixed(1)) -
        itemIndex;
      const hoverItemIndex = Number(
        ((e.clientX - shiftX) / itemAttr.itemWidth).toFixed(0)
      );
      if (maxLength <= hoverItemIndex || hoverItemIndex < 0) {
        mouseUpEvt(e);
        return;
      }
      if (hoverItemIndex != itemIndex && !isMoveDone) {
        //커서값에서 아이템크기만큼 나눠준다면 현재 선택한 아이템이 몇번째 인덱스로 이동하는지 알수있다,tofixed로 반올림해서 절반이 넘었는지 체크가능
        //선택한 아이템의 인덱스와 이동한 인덱스값과 다르다면 위치를 스왑해준다
        isMoveDone = true;
        const toIndex = dir > 0 ? itemIndex + 1 : itemIndex - 1;
        moveItem(itemIndex, toIndex);

        const hoverItemEle = document.getElementById(`moreview_item${toIndex}`)
          ?.children[0] as HTMLElement;
        let hoverItemPosX = Number(
          getFormatTranslateX(hoverItemEle.style.transform)
        );
        hoverItemEle.style.transform = `translateX(${originX}px)`;
        originX = hoverItemPosX;
        itemIndex = dir > 0 ? itemIndex + 1 : itemIndex - 1;
      }
    }
    e.preventDefault();
  };
  const mouseUpEvt = (e: any) => {
    if (e.button == 0) {
      const ele = document.getElementsByClassName("_indicators")[0].children[
        itemIndex
      ] as any;
      ele.click();
      getSelectItemEle(itemIndex).style.zIndex = "0";
      getSelectItemEle(itemIndex).style.transform = `translateX(${originX}px)`;
      itemIndex = -1;
      isItemClick = false;
      document.removeEventListener("mousemove", itemMoveEvt);
      document.removeEventListener("mouseup", mouseUpEvt);
    }
    e.preventDefault();
  };
  return (
    <div
      onDragStart={() => {
        return false;
      }}
      onSelect={() => {
        return false;
      }}
      onMouseDown={(e) => {
        if (e.button == 0) {
          isItemClick = true;
          itemIndex = itemAttr.index;
          const ele = getSelectItemEle(itemIndex);
          ele.style.zIndex = "99";
          shiftX = e.clientX - Number(getFormatTranslateX(ele.style.transform));
          originX = Number(
            getFormatTranslateX(
              `translateX(${itemAttr.index * itemAttr.itemWidth}px)`
            )
          );
          document.addEventListener("mousemove", itemMoveEvt);
          document.addEventListener("mouseup", mouseUpEvt);
        }
        e.preventDefault();
      }}
      style={{
        width: itemAttr.itemWidth,
      }}
      className={`flex-none flex justify-center absolute top-0 h-full p-1 rounded-lg duration-300`}
    >
      <div className="w-full h-full">
        <img
          src={itemAttr.url}
          style={{ transform: "translate3d(0, 0, 0)" }}
          className={`w-full h-full object-cover relative ${
            itemAttr.slideNumber == itemAttr.index ? "" : "opacity-50"
          }`}
        />
        <button
          onClick={(e) => {
            callback();
            e.stopPropagation();
          }}
          className={`${itemAttr.slideNumber == itemAttr.index ? "" : "hidden"} 
        absolute top-1 right-1 inline-flex h-6 w-6 items-center justify-center z-[1]
               rounded-full bg-white/30 hover:bg-white/50 focus:outline-none focus:ring-4
               focus:ring-white dark:bg-gray-800/30 dark:hover:bg-gray-800/60
                dark:focus:ring-gray-800/70`}
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
