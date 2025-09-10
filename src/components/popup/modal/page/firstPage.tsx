import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import {
  CloudArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { Carousel, Label, CustomFlowbiteTheme } from "flowbite-react";

import { calcSize, getFormatTranslateX } from "@/hooks/useUtil";
import { MoreContainer } from "../ui/moreContainer";
import { useUploadModal } from "../uploadModal";

const customTheme: CustomFlowbiteTheme["carousel"] = {
  root: {
    base: "relative h-full w-full z-[1]",
  },
  indicators: {
    active: {
      off: "bg-white/50 hover:bg-white dark:bg-gray-800/50 dark:hover:bg-gray-800 ",
      on: "bg-white dark:bg-gray-800",
    },
    base: "h-2 w-2 rounded-full",
    wrapper:
      "_indicators absolute top-5 left-1/2 flex -translate-x-1/2 gap-2 flex-wrap",
  },
  item: {
    base: "absolute block bg-white dark:bg-gray-700 w-full h-full ",
    wrapper: {
      off: "w-full flex-shrink-0 transform cursor-default snap-center",
      on: "w-full flex-shrink-0 transform cursor-grab snap-center",
    },
  },
  control: {
    base: "inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/30 group-hover:bg-white/50 group-focus:outline-none group-focus:ring-4 group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70 sm:h-10 sm:w-10",
    icon: "h-5 w-5 text-white dark:text-gray-800 sm:h-6 sm:w-6",
  },
  scrollContainer: {
    base: "flex h-full snap-mandatory overflow-y-hidden overflow-x-hidden scroll-smooth rounded-lg",
    snap: "snap-x",
  },
};

const FirstPage = ({
  videoEleRef,
  flowNumber,
}: {
  videoEleRef: MutableRefObject<{
    [key: string]: HTMLVideoElement;
  }>;
  flowNumber: number;
}) => {
  let mousePos = { x: 0, y: 0 };
  let isMouseClick = false;
  let targetIndex = -1;

  const [slideNumber, setSlideNumber] = useState<number>(0);
  const [isActive, setActive] = useState(false);
  const { dispatch, state } = useUploadModal();
  const handleDragStart = () => setActive(true);
  const handleDragEnd = (event: any) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setActive(false);
  };

  const uploadEvt = (_files: any) => {
    //파일 업로드는 10개까지만..
    if (_files.length > 11) {
      let fileArray = Array.from(_files);
      fileArray.splice(10, fileArray.length);
      _files = fileArray;
    }

    const contHeight =
      document.getElementById("firstpageContainer")!.offsetHeight;
    const contWidth =
      document.getElementById("firstpageContainer")!.offsetWidth;

    for (let i = 0; i < _files.length; i++) {
      const file = _files[i];
      const type = file.type.includes("image")
        ? "image"
        : file.type.includes("video")
        ? "video"
        : null;
      if (!type) {
        //잘못된 타입이 들어갔을때 처리
        dispatch({ type: "CLEAR_FILE_ITEM" });
        break;
      }
      const url = URL.createObjectURL(file);
      if (type == "image") {
        let img = document.createElement("img");
        img.src = url;
        img.onload = ({ target: img }) => {
          const imgEle = img as HTMLImageElement;
          const { height, width } = calcSize(
            imgEle.naturalHeight,
            imgEle.naturalWidth,
            contWidth,
            contHeight
          );
          dispatch({
            type: "ADD_FILES",
            payload: {
              fileId: "",
              thumbnail: null,
              origin: file,
              type,
              url,
              width,
              height,
              originWidth: imgEle.naturalWidth,
              originHeight: imgEle.naturalHeight,
            },
          });
        };
      } else if (type == "video") {
        let _video = document.createElement("video");
        let canvas = document.createElement("canvas");
        _video.src = url;
        _video.preload = "auto";
        _video.oncanplay = ({ target: video }) => {
          const videoEle = video as HTMLVideoElement;
          const { height, width } = calcSize(
            videoEle.videoHeight,
            videoEle.videoWidth,
            contWidth,
            contHeight
          );
          canvas.width = width;
          canvas.height = height;
          //const time = Math.random() * videoEle.duration; //비디오의 영상길이 중 랜덤 타임을 뽑음
          //videoEle.preload = "auto";
          //videoEle.currentTime = 0.1;
          let ctx = canvas.getContext("2d");
          setTimeout(() => {
            ctx?.drawImage(_video, 0, 0, width, height);

            canvas.toBlob(function (blob: any) {
              const thumb = URL.createObjectURL(blob);
              dispatch({
                type: "ADD_FILES",
                payload: {
                  origin: file,
                  type,
                  url,
                  width,
                  height,
                  fileId: "",
                  thumbnail: thumb,
                  duration: videoEle.duration,
                  originWidth: videoEle.videoWidth,
                  originHeight: videoEle.videoHeight,
                },
              });
            }, "image/jpg");
          }, 100);
        };
      }
    }
  };
  const mouseMoveEvt = (e: globalThis.MouseEvent) => {
    if (isMouseClick) {
      const slideItem = document.getElementById(`item_${targetIndex!}`)
        ?.children[0] as HTMLElement;
      const transform = getFormatTranslateX(slideItem.style.transform).split(
        ","
      );
      const x =
        mousePos.x === e.clientX ? 0 : e.clientX - mousePos.x > 0 ? -5 : 5;
      const y =
        mousePos.y === e.clientY ? 0 : e.clientY - mousePos.y > 0 ? -5 : 5;

      const changePos = {
        x: Number(transform[0]) + x,
        y: Number(transform[1]) + y,
      };
      slideItem.style.transform = `translate(${changePos.x}px,${changePos.y}px)`;
      mousePos = { x: e.clientX, y: e.clientY };
    }
  };

  const mouseUpEvt = () => {
    const slideItem = document.getElementById(`item_${targetIndex!}`)
      ?.children[0] as HTMLElement;

    slideItem.style.transition = "transform 0.3s ease"; // ✅ 부드럽게 원위치
    slideItem.style.transform = `translate(0px,0px)`;

    isMouseClick = false;
    document.removeEventListener("mousemove", mouseMoveEvt);
    document.removeEventListener("mouseup", mouseUpEvt);

    // transition 해제 (다음 드래그 대비)
    setTimeout(() => {
      slideItem.style.transition = "";
    }, 300);
  };
  useEffect(() => {
    if (flowNumber == 1 && videoEleRef.current[slideNumber]) {
      videoEleRef.current[slideNumber].pause();
    }
  }, [flowNumber]);

  useEffect(() => {
    if (state.fileItem.length <= 0) return;

    const contHeight =
      document.getElementById("firstpageContainer")!.offsetHeight;

    document
      .getElementById("firstPage_leftBtn")
      ?.parentNode?.parentElement?.setAttribute("style", "height:0px");

    document
      .getElementById("firstPage_leftBtn")
      ?.parentElement?.setAttribute(
        "style",
        `transform:translateY(${contHeight / 2}px)`
      );

    document
      .getElementById("firstPage_rightBtn")
      ?.parentNode?.parentElement?.setAttribute("style", "height:0px");

    document
      .getElementById("firstPage_rightBtn")
      ?.parentElement?.setAttribute(
        "style",
        `transform:translateY(${contHeight / 2}px)`
      );
  }, [state.fileItem]);

  return (
    <div
      id="firstpageContainer"
      className="flex w-full items-center justify-center h-full"
    >
      {state.fileItem?.length <= 0 ? (
        <Label
          id="uploadzone"
          onDragEnter={handleDragStart}
          onDragLeave={handleDragEnd}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={(event) => {
            uploadEvt(event.dataTransfer.files);
            event.preventDefault();
          }}
          htmlFor="dropzone-file"
          className={`${
            isActive
              ? "dark:bg-gray-600 dark:border-gray-500 bg-gray-100"
              : "dark:bg-gray-700 border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          } flex h-full w-full 
        cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed`}
        >
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <CloudArrowUpIcon className="w-12 h-12 text-gray-500 dark:text-gray-400 mb-2" />
            <p className="text-xl text-center font-semibold text-gray-500 dark:text-gray-400">
              사진이나 동영상을 컴퓨터에서 선택하거나
              <br></br>
              여기에 끌어다 놓으세요.
            </p>
          </div>
          <input
            multiple
            type="file"
            className="hidden"
            id="dropzone-file"
            onChange={(event) => {
              uploadEvt(event.target.files);
            }}
          />
        </Label>
      ) : (
        <div className="w-full h-full">
          <Carousel
            onSlideChange={async (curNumber) => {
              if (curNumber == state.fileItem.length) curNumber--;
              if (
                flowNumber == 0 &&
                Object.keys(videoEleRef.current).length > 0
              ) {
                if (
                  slideNumber != curNumber &&
                  videoEleRef.current[slideNumber]
                ) {
                  await videoEleRef.current[slideNumber].pause();
                }

                if (videoEleRef.current[curNumber]) {
                  videoEleRef.current[curNumber].currentTime = 0;
                  await videoEleRef.current[curNumber].play();
                }
              }
              setSlideNumber(curNumber);
            }}
            theme={customTheme}
            slide={false}
            draggable={false}
            leftControl={
              <div
                id="firstPage_leftBtn"
                className={`${state.fileItem.length == 1 ? "hidden" : ""}
                inline-flex h-8 w-8 items-center justify-center z-[1]
               rounded-full bg-white/30 group-hover:bg-white/50 group-focus:outline-none group-focus:ring-4
               group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60
                dark:group-focus:ring-gray-800/70 sm:h-10 sm:w-10`}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </div>
            }
            rightControl={
              <div
                id="firstPage_rightBtn"
                className={`${state.fileItem.length == 1 ? "hidden" : ""}
                inline-flex h-8 w-8 items-center justify-center z-[1]
               rounded-full bg-white/30 group-hover:bg-white/50 group-focus:outline-none group-focus:ring-4
               group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60
                dark:group-focus:ring-gray-800/70 sm:h-10 sm:w-10`}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </div>
            }
          >
            {state.fileItem.map((v, i) => {
              return (
                <div
                  id={`item_${i}`}
                  key={i}
                  className="w-full h-full flex justify-center items-center"
                >
                  {v?.type == "image" ? (
                    <div
                      style={{
                        background: `url(${v.url})`,
                        transform: "translate(0px,0px)",
                        width: `${
                          v.width! <
                          document.getElementById("firstpageContainer")!
                            .offsetWidth
                            ? `${v.width}px`
                            : "100%"
                        }`,
                      }}
                      className={`flex-none h-full !bg-center !bg-no-repeat !bg-cover`}
                    />
                  ) : (
                    <div
                      className="flex-none"
                      style={{
                        width: v.width,
                        height: v.height,
                      }}
                    >
                      <video
                        className="flex-none w-full h-full object-cover"
                        style={{
                          transform: "translate(0px,0px)",
                        }}
                        onCanPlay={(event) => {
                          const ele = event.target as HTMLVideoElement;
                          const key = i.toString();
                          videoEleRef.current[key] = ele;
                          if (i == 0) ele.play(); // 첫 번째 비디오만 자동재생
                        }}
                        src={v.url}
                        width={v.width}
                        height={v.height}
                        muted // ✅ 무음
                        loop // ✅ 반복
                        playsInline // ✅ 모바일 인라인 재생
                      />
                    </div>
                  )}
                  <div
                    id="mouseDetection"
                    className="w-full h-full fixed top-0"
                    onMouseDown={(e) => {
                      if (e.button == 0) {
                        mousePos = { x: e.clientX, y: e.clientY };
                        targetIndex = i;
                        isMouseClick = true;
                        const slideItem = document.getElementById(
                          `item_${targetIndex!}`
                        )?.children[0] as HTMLElement;

                        document.addEventListener("mousemove", mouseMoveEvt);
                        document.addEventListener("mouseup", mouseUpEvt);
                      }
                    }}
                  ></div>
                </div>
              );
            })}
          </Carousel>
          <div
            id="moreContainer"
            className={`bottom-20 pr-3 pb-3 right-8 absolute w-auto h-auto z-10`}
          >
            <MoreContainer slideNumber={slideNumber} uploadEvt={uploadEvt} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FirstPage;
