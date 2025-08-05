"use client";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useReducer,
  useState,
} from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import { getFormatTranslateX } from "@/hooks/useUtil";
import { MoreItem } from "./moreItem";
import { useUI } from "@/components/uiProvider";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { useUploadModal } from "../uploadModal";

type State = {
  maxWidth: number;
  itemWidth: number;
  width: number;
  leftActive: boolean;
  rightActive: boolean;
};

type Action =
  | { type: "SET_DIR_ACTIVE"; payload: Partial<State> }
  | { type: "SET_WIDTH"; payload: Partial<State> };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_WIDTH":
      return { ...state, ...action.payload };
    case "SET_DIR_ACTIVE":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};
const initialState: State = {
  maxWidth: 0,
  itemWidth: 0,
  width: 0,
  leftActive: false,
  rightActive: false,
};

export const MoreView = ({
  slideNumber,
  uploadEvt,
}: {
  slideNumber: number;
  uploadEvt: (file: any) => void;
}) => {
  const { openModal } = useUI();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { dispatch: modalDispatch, state: modalState } = useUploadModal();

  useEffect(() => {
    const maxWidth = Number(
      document.getElementById("firstpageContainer")?.clientWidth
    );
    const _itemWidth = maxWidth / 6;
    let widthSum = 0;
    //파일 갯수만큼 아이템의 넓이,마진값을 더함(마진값은 6)
    for (let i = 0; i < modalState.fileItem.length; i++) {
      widthSum += _itemWidth;
    }

    dispatch({
      type: "SET_WIDTH",
      payload: {
        itemWidth: _itemWidth,
        maxWidth: maxWidth - _itemWidth,
        width: widthSum,
      },
    });
    //모든 아이템 넓이를 합한값이 보여지는 최대 넓이값 보다 클때(끝에있는 버튼넓이도 뺌)
    if (widthSum > maxWidth - _itemWidth * 2) {
      dispatch({
        type: "SET_DIR_ACTIVE",
        payload: {
          rightActive: true,
          leftActive: false,
        },
      });
    }
  }, [modalState.fileItem]);

  const moveItem = (from: number, to: number) => {
    modalDispatch({
      type: "MOVE_FILE_ITEM",
      payload: {
        from,
        to,
      },
    });
  };

  const removeItem = async (removeIndex: number) => {
    const result = await openModal("ALERT", {
      msg: "파일을 삭제 하시겠습니까?",
      btnMsg: ["삭제", "취소"],
      title: "파일 삭제",
    });
    if (result) {
      modalDispatch({ type: "REMOVE_FILE_ITEM", payload: removeIndex });
    }
  };

  const dirBtnClickEvt = (e: any) => {
    const btnId = (e.target as HTMLElement).id;
    let dir = -1;
    if (btnId.includes("left")) {
      dir = 1;
    }
    //보여지는 영역의값
    let maxWidth = Number(
      document
        .getElementById("moreview_ScrollArea")
        ?.style.maxWidth.replace("px", "")
    );
    let ele = document.getElementById("moreview_ScrollArea")
      ?.children[0] as HTMLElement;
    let x = Number(getFormatTranslateX(ele.style.transform));
    let scrollWidth = state.width - maxWidth + x; //총 넓이 - 보여지는넓이   = 스크롤할수있는넓이
    let moveX = 0;

    if (dir < 0) {
      moveX = scrollWidth > maxWidth ? maxWidth : scrollWidth;
    } else {
      moveX = -x > maxWidth ? maxWidth : -x;
    }
    ele.style.transform = `translateX(${x + dir * moveX}px)`;
    dirBtnActive();

    e.stopPropagation();
  };

  const dirBtnActive = () => {
    let ele = document.getElementById("moreview_ScrollArea")
      ?.children[0] as HTMLElement;
    let scrollPosX = Number(getFormatTranslateX(ele.style.transform));
    let rightActive = false;
    let leftActive = false;

    if (scrollPosX == 0) {
      rightActive = true;
      leftActive = false;
    } else if (
      Math.abs(scrollPosX) ==
      state.width - (state.maxWidth - state.itemWidth)
    ) {
      rightActive = false;
      leftActive = true;
    } else {
      rightActive = true;
      leftActive = true;
    }
    dispatch({
      type: "SET_DIR_ACTIVE",
      payload: {
        rightActive,
        leftActive,
      },
    });
  };

  return (
    <div
      style={{
        maxWidth: state.maxWidth,
        width: state.width + state.itemWidth,
        height: state.itemWidth,
      }}
      className="relative rounded-lg flex overflow-hidden bg-[rgba(18,18,18,0.5)]"
    >
      <div
        style={{
          scrollbarWidth: "none",
          maxWidth: state.maxWidth - state.itemWidth,
          width: state.width,
        }}
        id="moreview_ScrollArea"
        className="relative flex-none overflow-x-auto overflow-y-hidden flex h-full items-center"
      >
        <div
          style={{ transform: "translateX(0px)" }}
          className="duration-300 w-full h-full"
        >
          {modalState.fileItem.map((v, i) => {
            return (
              <div key={v.url} id={`moreview_item${i}`}>
                <MoreItem
                  itemAttr={{
                    index: i,
                    itemWidth: state.itemWidth,
                    slideNumber,
                    url: v.type == "image" ? v.url : v.thumbnail!,
                  }}
                  callback={() => {
                    removeItem(i);
                  }}
                  moveItem={moveItem}
                  maxLength={modalState.fileItem.length}
                />
              </div>
            );
          })}
        </div>
        <button
          id="_left"
          onClick={dirBtnClickEvt}
          className={`${state.leftActive ? "" : "hidden"}
          absolute left-1 z-10 w-6 h-6 bg-white rounded-full flex items-center justify-center`}
        >
          <ChevronLeftIcon className="w-4 h-4  text-black pointer-events-none" />
        </button>
        <button
          id="_right"
          onClick={dirBtnClickEvt}
          className={`${state.rightActive ? "" : "hidden"}
          absolute right-2 z-10 w-6 h-6 bg-white rounded-full flex items-center justify-center`}
        >
          <ChevronRightIcon className="w-4 h-4  text-black pointer-events-none" />
        </button>
      </div>
      <div className="h-full flex-auto z-10  flex items-center justify-center">
        <label
          htmlFor="plusAddFile"
          className="h-8 w-8 justify-center items-center flex cursor-pointer
          rounded-full bg-white/30 hover:bg-white/50 focus:outline-none focus:ring-4
               focus:ring-white dark:bg-gray-800/30 dark:hover:bg-gray-800/60
                dark:focus:ring-gray-800/70"
        >
          <PlusIcon className="w-6 h-6" />
          <input
            multiple
            type="file"
            className="hidden"
            id="plusAddFile"
            onChange={(event) => {
              uploadEvt(event.target.files);
            }}
          />
        </label>
      </div>
    </div>
  );
};

export default MoreView;
