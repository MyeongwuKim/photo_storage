"use client";

import { getThumbnailURL } from "@/hooks/useUtil";
import Hls from "hls.js";
import Image from "next/image";
import { FC, MediaHTMLAttributes, useEffect, useRef, useState } from "react";

interface VideoProps {
  props?: MediaHTMLAttributes<HTMLVideoElement>;
  src: string;
}
let interval: null | NodeJS.Timeout = null;

export const VideoItem: FC<VideoProps> = ({ props, src }) => {
  const videoRef = useRef<any>(null);
  const [isCanplay, setIsCanplay] = useState<boolean>(true);
  const [thumbEnable, setThumbEnable] = useState<boolean>(true);
  useEffect(() => {
    var hls = new Hls();
    hls.loadSource(`https://videodelivery.net/${src}/manifest/video.m3u8`);
    hls.attachMedia(videoRef.current!);
    const contEle = document.getElementById(`videoItemContainer_${src}`);

    videoRef.current.loop = true;
    videoRef.current.oncanplaythrough = () => {
      setIsCanplay(true);
      // contEle?.addEventListener("mouseover", () => {
      //   console.log("over?");

      // });
      // contEle?.addEventListener("mouseleave", () => {

      // });
    };
  }, []);

  useEffect(() => {
    if (thumbEnable) {
      videoRef.current?.pause();
      videoRef.current.currentTime = 0;
    } else {
      videoRef.current?.play();
    }
  }, [thumbEnable]);

  return (
    <div
      id={`videoItemContainer_${src}`}
      className="relative aspect-square  place-items-center overflow-hidden rounded-lg cursor-pointer"
      onMouseOver={() => {
        interval = setInterval(() => {
          if (isCanplay) {
            if (interval && thumbEnable) {
              clearInterval(interval);
            }
            setThumbEnable(false);
          }
        }, 100);
      }}
      onMouseLeave={() => {
        if (interval) clearInterval(interval);
        setThumbEnable(true);
      }}
    >
      <Image
        priority
        alt="image"
        width={0}
        height={0}
        sizes="100vw"
        className={`${
          thumbEnable ? "visible" : "hidden"
        } absolute h-full w-full object-cover`}
        src={getThumbnailURL("video", src)}
      />
      <video
        {...props}
        className="w-full h-full object-cover"
        ref={videoRef}
        muted={true}
      />
    </div>
  );
};

export default VideoItem;
