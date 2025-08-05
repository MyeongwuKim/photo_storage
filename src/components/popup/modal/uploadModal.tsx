"use client";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useReducer,
  useContext,
} from "react";
import { Carousel } from "flowbite-react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import { activeLoading, activeLoadingMsg } from "@/hooks/useEvent";
import FirstPage from "./page/firstPage";
import SecondPage from "./page/secondPage";
import { carouselTheme } from "@/hooks/useFlowTheme";
import { timeStamp } from "@/hooks/useUtil";
import { usePathname } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import getQueryClient from "@/hooks/useQueryClient";
import { useUI } from "../../uiProvider";
import { useAppSelector } from "@/redux/store/hooks";
import { useDispatch } from "react-redux";

const slideBtnStyle = `w-16 h-10 absolute top-3 px-4 py-2.5
              text-sm font-medium text-gray-900 focus:outline-none
             bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700
             focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800
             dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700`;

let parentRightBtn: HTMLElement;

interface FileProps extends FileType {
  thumbnail?: string;
  origin: any;
}

type State = {
  fileItem: FileProps[];
};

type Action =
  | { type: "ADD_FILES"; payload: FileProps }
  | { type: "MOVE_FILE_ITEM"; payload: { from: number; to: number } }
  | { type: "REMOVE_FILE_ITEM"; payload: number }
  | { type: "CLEAR_FILE_ITEM" };

const initialState: State = {
  fileItem: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_FILES":
      return {
        ...state,
        fileItem: [...state.fileItem, action.payload],
      };
    case "MOVE_FILE_ITEM": {
      const { from, to } = action.payload;
      const newFileItem = [...state.fileItem];
      const [movedItem] = newFileItem.splice(from, 1);
      newFileItem.splice(to, 0, movedItem);
      return { ...state, fileItem: newFileItem };
    }
    case "REMOVE_FILE_ITEM": {
      const index = action.payload;
      return {
        ...state,
        fileItem: state.fileItem.filter((_, i) => i !== index),
      };
    }
    case "CLEAR_FILE_ITEM":
      return {
        ...state,
        fileItem: [],
      };
    default:
      return state;
  }
}

type ContextType = {
  state: State;
  dispatch: React.Dispatch<Action>;
};

const UploadModalContext = createContext<ContextType | undefined>(undefined);

const UploadModal = ({ onClose }: { onClose: (result?: any) => void }) => {
  const queryClient = getQueryClient();
  const pathname = usePathname();
  const reduxDispatch = useDispatch();
  const { openToast, openModal } = useUI();
  const [state, dispatch] = useReducer(reducer, initialState);

  const createPost = useMutation({
    mutationFn: async ({
      files,
      info,
    }: {
      files: FileType[];
      info: InfoType;
    }) =>
      await fetch("/api/post", {
        method: "post",
        body: JSON.stringify({ files, info }),
      }),
    onSuccess: async (data) => {
      activeLoading(false);
      const result = await data.json();
      if (result.ok) {
        parentRightBtn?.click();
        const key = pathname.replace("/", "").length <= 0 ? "post" : pathname;
        await queryClient.refetchQueries({
          queryKey: ["tab"],
        });
      } else {
        openToast(true, result.error, 1.5);
      }
    },
  });

  const [flowNumber, setFlowNumber] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const videoEleRef = useRef<{ [key: string]: HTMLVideoElement }>({});
  const secondPageRef = useRef<{
    tag: string[];
    comment: string;
    date: Date;
    mapData: MapDataType;
    score: number;
  }>({
    date: new Date(),
    comment: "",
    mapData: { location: { lat: 0, lng: 0 }, placeAddress: "" },
    tag: [],
    score: 5,
  });

  useEffect(() => {
    parentRightBtn = document.getElementById("rightArrow")
      ?.parentElement as HTMLElement;
  }, []);
  useEffect(() => {
    switch (flowNumber) {
      case 0:
        setTitle(state.fileItem.length <= 0 ? "파일 업로드" : "파일 미리보기");
        break;
      case 1:
        setTitle("추가 작성");
        break;
      case 2:
        setTitle("");
        break;
    }
  }, [state.fileItem, flowNumber]);
  //비디오의 용량 길이 제한을 둘것인가?
  const uploadFile = async (file: any, type: string) => {
    let result = null;
    try {
      const resData = await (
        await fetch(`/api/upload/${type}`, { method: "POST" })
      ).json();
      const form = new FormData();
      const filename = file.name.split(".");
      form.append(
        "file",
        file,
        `${process.env.NODE_ENV}_PhotoStorage_${type}_${
          filename[0]
        }_${timeStamp()}`
      );
      if (type == "image") {
        const {
          result: { id },
        } = await (
          await fetch(resData.uploadURL, {
            method: "POST",
            body: form,
          })
        ).json();
        result = id;
      } else {
        await fetch(resData.uploadURL, {
          method: "POST",
          body: form,
        });
        result = resData.uid;
      }
    } catch {
      result = null;
    }
    return result;
  };

  const exitEvt = async () => {
    if (state.fileItem.length <= 0) onClose();
    else {
      const result = await openModal("ALERT", {
        btnMsg: ["삭제", "취소"],
        msg: "게시물 작성을 취소하시겠습니까?",
        title: "작성 취소",
      });
      if (result) {
        if (videoEleRef.current) {
          Object.keys(videoEleRef.current).forEach((key) => {
            videoEleRef.current[key].pause();
          });
        }
        dispatch({ type: "CLEAR_FILE_ITEM" });
        if (flowNumber == 1) {
          secondPageRef.current = {
            tag: [],
            comment: "",
            date: new Date(),
            mapData: { location: { lat: 0, lng: 0 }, placeAddress: "" },
            score: 5,
          };
          document.getElementById("leftSlideBtn")?.parentElement?.click();
        }
      }
    }
  };

  return (
    <UploadModalContext.Provider value={{ dispatch, state }}>
      <div
        id="uploadModal"
        className="top-0 left-0 fixed w-full h-full flex items-center justify-center"
      >
        <div
          onClick={exitEvt}
          id="uploadPannel"
          className="absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] "
        />
        <div id="modalContainer" className="h-[640px] w-[640px]  relative">
          <div className="text-2xl font-bold absolute w-full text-center z-[2] top-5 pointer-events-none ">
            {title}
          </div>
          <Carousel
            onSlideChange={(number) => {
              setFlowNumber(number);
            }}
            indicators={false}
            theme={carouselTheme}
            slide={false}
            draggable={false}
            rightControl={
              flowNumber == 1 ? (
                <CheckIcon
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (secondPageRef.current.tag.length <= 0) {
                      openToast(true, "태그정보를 입력해주세요.", 1.5);
                      return;
                    }
                    activeLoading(true);
                    const newFiles = [...state.fileItem];
                    let count = 0;
                    while (count < newFiles.length) {
                      activeLoadingMsg(
                        `Upload ${newFiles[count].type}.. (${count}/${state.fileItem.length})`
                      );
                      let file = newFiles[count];
                      let id = await uploadFile(file.origin, file.type);
                      delete file.origin;
                      if (id == null) {
                        openToast(true, "업로드중 오류가 발생했습니다.", 1.5);
                        newFiles.splice(count, 1);
                      } else {
                        file.url = id;
                        count++;
                      }
                    }

                    await createPost.mutate({
                      files: newFiles,
                      info: secondPageRef.current,
                    });

                    // await Revalidate(pathname);
                  }}
                  className={`${slideBtnStyle} right-3 ${
                    flowNumber >= 2 ? "hidden" : ""
                  }`}
                />
              ) : (
                <ArrowRightIcon
                  id="rightArrow"
                  className={`${slideBtnStyle} right-3 ${
                    flowNumber == 0 && state.fileItem.length <= 0
                      ? "hidden"
                      : ""
                  } ${flowNumber >= 2 ? "hidden" : ""}`}
                />
              )
            }
            leftControl={
              <ArrowLeftIcon
                id="leftSlideBtn"
                onClick={(event) => {
                  if (flowNumber == 0) {
                    exitEvt();
                    event.stopPropagation();
                  }
                }}
                className={`${slideBtnStyle} ${
                  flowNumber >= 2 ? "hidden" : ""
                }`}
              />
            }
          >
            <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-20">
              <FirstPage flowNumber={flowNumber} videoEleRef={videoEleRef} />
            </div>
            <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-20">
              <SecondPage valueRef={secondPageRef} />
            </div>
            <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-20">
              <div className="flex items-center justify-center flex-col w-full h-full gap-4">
                <CheckIcon className="w-12 h-12 rounded-full border-2 animate-bounce"></CheckIcon>
                <div className="font-semibold text-2xl">
                  업로드가 완료되었습니다.
                </div>
              </div>
            </div>
          </Carousel>
        </div>
      </div>
    </UploadModalContext.Provider>
  );
};

export const useUploadModal = () => {
  const context = useContext(UploadModalContext);
  if (!context)
    throw new Error("useUploadModal must be used within UploadModalProvider");
  return context;
};

export default UploadModal;
