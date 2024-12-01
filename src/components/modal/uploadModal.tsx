"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { Carousel } from "flowbite-react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import {
  activeLoading,
  activeLoadingMsg,
  createModal,
  createToast,
  removeModal,
} from "@/hooks/useEvent";
import AlertModal from "./alertModal";
import FirstPage from "./uploadpage/firstPage";
import SecondPage from "./uploadpage/secondPage";
import { carouselTheme } from "@/hooks/useFlowTheme";
import { timeStamp } from "@/hooks/useUtil";
import { usePathname } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import getQueryClient from "@/hooks/useQueryClient";

type FileType = {
  origin: any;
  url: string;
  type: string;
  width?: number;
  height?: number;
  duration?: number;
};
type MapDataType = {
  placeAddress: string;
  location: google.maps.LatLngLiteral;
};

type InfoType = {
  tag: string[];
  comment: string;
  date: Date;
  mapData: MapDataType;
  score: number;
};

const slideBtnStyle = `w-16 h-10 absolute top-3 px-4 py-2.5
              text-sm font-medium text-gray-900 focus:outline-none
             bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700
             focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800
             dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700`;

let parentRightBtn: HTMLElement;

interface CreatePostRes {
  ok: boolean;
  error: string;
}
const UploadModal = () => {
  const queryClient = getQueryClient();
  const pathname = usePathname();
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
        setFiles([]);
        parentRightBtn?.click();
        const key = pathname.replace("/", "").length <= 0 ? "post" : pathname;
        await queryClient.refetchQueries({
          queryKey: ["tab"],
        });
      } else {
        createToast(result.error, true);
      }
    },
  });
  const [files, setFiles] = useState<FileType[]>([]);
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
    if (flowNumber == 0) {
      setTitle(files.length <= 0 ? "파일 업로드" : "파일 미리보기");
    } else if (flowNumber == 1) {
      setTitle("추가 작성");
    } else if (flowNumber == 2) {
      setTitle("");
    }
  }, [files, flowNumber]);
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

  const exitEvt = () => {
    if (files.length <= 0) removeModal();
    else {
      createModal(
        <AlertModal
          btnMsg={["삭제", "취소"]}
          msg={
            <div>
              <div className="text-lg">게시물을 삭제 하시겠습니까?</div>
              <div className="mt-2  text-lightText-1 dark:text-darkText-1 text-sm">
                수정된 내용은 저장되지 않습니다.
              </div>
            </div>
          }
          callback={() => {
            if (videoEleRef.current) {
              Object.keys(videoEleRef.current).forEach((key) => {
                videoEleRef.current[key].pause();
              });
            }
            setFiles([]);
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
          }}
        />
      );
    }
  };

  return (
    <div
      id="uploadModal"
      className="top-0 left-0 fixed w-full h-full flex items-center justify-center"
    >
      <div
        onClick={() => {
          exitEvt();
        }}
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
                    createToast("태그정보를 입력해주세요.", true);
                    return;
                  }
                  activeLoading(true);
                  const newFiles = [...files];
                  let count = 0;
                  while (count < newFiles.length) {
                    activeLoadingMsg(
                      `Upload ${newFiles[count].type}.. (${count}/${files.length})`
                    );
                    let file = newFiles[count];
                    let id = await uploadFile(file.origin, file.type);
                    delete file.origin;
                    if (id == null) {
                      createToast("업로드중 오류가 발생했습니다.", true);
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
                  flowNumber == 0 && files.length <= 0 ? "hidden" : ""
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
              className={`${slideBtnStyle} ${flowNumber >= 2 ? "hidden" : ""}`}
            />
          }
        >
          <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-20">
            <FirstPage
              flowNumber={flowNumber}
              videoEleRef={videoEleRef}
              files={files}
              setFiles={setFiles}
            />
          </div>
          <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-20">
            <SecondPage valueRef={secondPageRef} files={files} />
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
  );
};

export default UploadModal;
