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
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { Carousel, Label, CustomFlowbiteTheme } from "flowbite-react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { createModal } from "@/hooks/useEvent";
import AlertModal from "../alertModal";

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

type FileType = {
  origin: any;
  url: string;
  type: string;
  width?: number;
  height?: number;
  thumbnail?: string;
  duration?: number;
};

const getFormatTranslateX = (translateX: string) => {
  return translateX.replace(/[(\)\a-z\s]/gim, "");
};

const FirstPage = ({
  files,
  setFiles,
  videoEleRef,
  flowNumber,
}: {
  files: FileType[];
  setFiles: Dispatch<SetStateAction<FileType[]>>;
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

    let fileSwap = [];
    const contHeight =
      document.getElementById("firstpageContainer")!.offsetHeight;
    const contWidth =
      document.getElementById("firstpageContainer")!.offsetWidth;
    const calcSize = (
      originH: number,
      originW: number
    ): { width: number; height: number } => {
      let ratio = 0,
        width = 0,
        height = 0;

      if (originH <= originW) {
        ratio = contHeight / (originH / 100);
        width = Math.ceil((originW / 100) * ratio);
        height = contHeight;
      } else {
        ratio = contWidth / (originW / 100);
        height = Math.ceil((originH / 100) * ratio);
        width = contWidth;
      }
      return { width, height };
    };

    for (let i = 0; i < _files.length; i++) {
      const file = _files[i];
      const type = file.type.includes("image")
        ? "image"
        : file.type.includes("video")
        ? "video"
        : null;
      if (!type) {
        //잘못된 타입이 들어갔을때 처리
        setFiles([]);
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
            imgEle.naturalWidth
          );

          setFiles((prev) => {
            let arr = [
              ...prev,
              {
                origin: file,
                type,
                url,
                width,
                height,
              },
            ];
            return arr;
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
            videoEle.videoWidth
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
              setFiles((prev) => {
                const thumb = URL.createObjectURL(blob);
                let arr = [
                  ...prev,
                  {
                    origin: file,
                    type,
                    url,
                    width,
                    height,
                    thumbnail: thumb,
                    duration: videoEle.duration,
                  },
                ];
                return arr;
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
        mousePos.x == e.clientX ? 0 : e.clientX - mousePos.x > 0 ? -5 : 5;
      const y =
        mousePos.y == e.clientY ? 0 : e.clientY - mousePos.y > 0 ? -5 : 5;

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
    // slideItem.style.width = `${files[targetIndex].width + "px"}`;
    // slideItem.style.height = `${files[targetIndex].height + "px"}`;
    slideItem.style.width = "100%";
    slideItem.style.height = "100%";
    slideItem.style.transform = `translate(${0}px,${0}px)`;
    isMouseClick = false;
    document.removeEventListener("mousemove", mouseMoveEvt);
    document.removeEventListener("mouseup", mouseUpEvt);
  };
  useEffect(() => {
    if (flowNumber == 1 && videoEleRef.current[slideNumber]) {
      videoEleRef.current[slideNumber].pause();
    }
  }, [flowNumber]);

  useEffect(() => {
    if (files.length <= 0) return;

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
  }, [files]);

  return (
    <div
      id="firstpageContainer"
      className="flex w-full items-center justify-center h-full"
    >
      {files?.length <= 0 ? (
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
              if (curNumber == files.length) curNumber--;
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
                className={`${files.length == 1 ? "hidden" : ""}
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
                className={`${files.length == 1 ? "hidden" : ""}
                inline-flex h-8 w-8 items-center justify-center z-[1]
               rounded-full bg-white/30 group-hover:bg-white/50 group-focus:outline-none group-focus:ring-4
               group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60
                dark:group-focus:ring-gray-800/70 sm:h-10 sm:w-10`}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </div>
            }
          >
            {files.map((v, i) => {
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
                        width: `${
                          v.width! <
                          document.getElementById("firstpageContainer")!
                            .offsetWidth
                            ? `${v.width}px`
                            : "100%"
                        }`,
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
                          if (i == 0) ele.play();
                        }}
                        src={v.url}
                        width={v.width}
                        height={v.height}
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

                        slideItem.style.width = `${files[i].width}px`;
                        slideItem.style.height = `${files[i].height}px`;

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
            <MoreContainer
              files={files}
              setFiles={setFiles}
              slideNumber={slideNumber}
              uploadEvt={uploadEvt}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const MoreContainer = ({
  files,
  setFiles,
  slideNumber,
  uploadEvt,
}: {
  slideNumber: number;
  files: FileType[];
  setFiles: Dispatch<SetStateAction<FileType[]>>;
  uploadEvt: (file: any) => void;
}) => {
  const [isMoreAcitve, setMoreAcitve] = useState<boolean>(false);

  return (
    <div className="flex flex-col items-end relative w-auto h-auto">
      <div className={`${isMoreAcitve ? "" : "hidden"}`}>
        <div
          onClick={() => setMoreAcitve(false)}
          id="morePannel"
          className="z-[-1] flex-none w-full h-full fixed top-0 left-0"
        />
        <MoreView
          slideNumber={slideNumber}
          files={files}
          setFiles={setFiles}
          setMoreActive={setMoreAcitve}
          uploadEvt={uploadEvt}
        />
      </div>
      <button
        onClick={() => setMoreAcitve(!isMoreAcitve)}
        id="moreBtn"
        className="relative mt-2 inline-flex h-8 w-8 items-center justify-center z-[1]
               rounded-full bg-white/30 hover:bg-white/50 focus:outline-none focus:ring-4
               focus:ring-white dark:bg-gray-800/30 dark:hover:bg-gray-800/60
                dark:focus:ring-gray-800/70 sm:h-10 sm:w-10"
      >
        <EllipsisVerticalIcon className="w-6 h-6" />
      </button>
    </div>
  );
};
export const MoreView = ({
  slideNumber,
  files,
  setFiles,
  setMoreActive,
  uploadEvt,
}: {
  slideNumber: number;
  files: FileType[];
  setFiles: Dispatch<SetStateAction<FileType[]>>;
  setMoreActive: Dispatch<SetStateAction<boolean>>;
  uploadEvt: (file: any) => void;
}) => {
  const [maxWidth, setMaxWidth] = useState<number>(0);
  const [itemWidth, setItemWidth] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [leftActive, setLeftActive] = useState<boolean>(false);
  const [rightActive, setRightActive] = useState<boolean>(false);

  useEffect(() => {
    const maxWidth = Number(
      document.getElementById("firstpageContainer")?.clientWidth
    );
    const _itemWidth = maxWidth / 6;
    let widthSum = 0;
    //파일 갯수만큼 아이템의 넓이,마진값을 더함(마진값은 6)
    for (let i = 0; i < files.length; i++) {
      widthSum += _itemWidth;
    }
    setItemWidth(_itemWidth);
    setMaxWidth(maxWidth - _itemWidth);
    setWidth(widthSum);
    //모든 아이템 넓이를 합한값이 보여지는 최대 넓이값 보다 클때(끝에있는 버튼넓이도 뺌)
    if (widthSum > maxWidth - _itemWidth * 2) {
      setRightActive(true);
    }
  }, [files]);

  const moveItem = (selectIndex: number, toIndex: number) => {
    setFiles((prev) => {
      let newValue = [...prev];
      let item = newValue.splice(toIndex, 1, newValue[selectIndex]);
      newValue.splice(selectIndex, 1, item[0]);
      return newValue;
    });
  };

  const removeItem = (removeIndex: number) => {
    createModal(
      <AlertModal
        btnMsg={["삭제", "취소"]}
        msg={
          <div>
            <div className="text-lg">파일을 삭제 하시겠습니까?</div>
          </div>
        }
        callback={() => {
          setFiles((prev) => {
            let newValue = [...prev];
            newValue.splice(removeIndex, 1);
            return newValue;
          });
        }}
      />
    );
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
    let scrollWidth = width - maxWidth + x; //총 넓이 - 보여지는넓이   = 스크롤할수있는넓이
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

    if (scrollPosX == 0) {
      setLeftActive(false);
      setRightActive(true);
    } else if (Math.abs(scrollPosX) == width - (maxWidth - itemWidth)) {
      setLeftActive(true);
      setRightActive(false);
    } else {
      setLeftActive(true);
      setLeftActive(true);
    }
  };

  return (
    <div
      style={{ maxWidth, width: width + itemWidth, height: itemWidth }}
      className="relative rounded-lg flex overflow-hidden bg-[rgba(18,18,18,0.5)]"
    >
      <div
        style={{
          scrollbarWidth: "none",
          maxWidth: maxWidth - itemWidth,
          width,
        }}
        id="moreview_ScrollArea"
        className="relative flex-none overflow-x-auto overflow-y-hidden flex h-full items-center"
      >
        <div
          style={{ transform: "translateX(0px)" }}
          className="duration-300 w-full h-full"
        >
          {files.map((v, i) => {
            return (
              <div key={v.url} id={`moreview_item${i}`}>
                <MoreItem
                  itemAttr={{
                    index: i,
                    itemWidth,
                    slideNumber,
                    url: v.type == "image" ? v.url : v.thumbnail!,
                  }}
                  callback={() => {
                    removeItem(i);
                  }}
                  moveItem={moveItem}
                  maxLength={files.length}
                />
              </div>
            );
          })}
        </div>
        <button
          id="_left"
          onClick={dirBtnClickEvt}
          className={`${leftActive ? "" : "hidden"}
          absolute left-1 z-10 w-6 h-6 bg-white rounded-full flex items-center justify-center`}
        >
          <ChevronLeftIcon className="w-4 h-4  text-black pointer-events-none" />
        </button>
        <button
          id="_right"
          onClick={dirBtnClickEvt}
          className={`${rightActive ? "" : "hidden"}
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

export default FirstPage;
