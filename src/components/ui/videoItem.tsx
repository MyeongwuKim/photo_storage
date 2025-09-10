"use client";

import { getThumbnailURL } from "@/hooks/useUtil";
import Hls from "hls.js";
import Image from "next/image";
import {
  FC,
  MediaHTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface VideoProps {
  props?: MediaHTMLAttributes<HTMLVideoElement>;
  thumbnail: string | null;
  src: string;
}

export const VideoItem: FC<VideoProps> = ({ props, src, thumbnail }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoThumb = useMemo(() => {
    if (process.env.NEXT_PUBLIC_DEMO) return thumbnail;
    else return getThumbnailURL("video", src);
  }, [src]);

  const [isCanplay, setIsCanplay] = useState(false);
  const [thumbEnable, setThumbEnable] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;

    let url = process.env.NEXT_PUBLIC_DEMO
      ? src
      : `https://videodelivery.net/${src}/manifest/video.m3u8`;

    if (process.env.NEXT_PUBLIC_DEMO) {
      videoRef.current.src = url;
    } else {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoRef.current);
      } else {
        videoRef.current.src = url; // Safari fallback
      }
    }

    videoRef.current.loop = true;
    videoRef.current.oncanplaythrough = () => setIsCanplay(true);
  }, [src]);

  useEffect(() => {
    if (!videoRef.current) return;

    if (thumbEnable) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    } else {
      videoRef.current
        .play()
        .catch((err) => err.name !== "AbortError" && console.error(err));
    }
  }, [thumbEnable]);

  return (
    <div
      id={`videoItemContainer_${src}`}
      className="relative aspect-square place-items-center overflow-hidden rounded-lg cursor-pointer"
      onMouseOver={() => {
        intervalRef.current = setInterval(() => {
          if (isCanplay) {
            if (intervalRef.current && thumbEnable) {
              clearInterval(intervalRef.current);
            }
            setThumbEnable(false);
          }
        }, 100);
      }}
      onMouseLeave={() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setThumbEnable(true);
      }}
    >
      <Image
        priority
        alt="video thumbnail"
        src={videoThumb!}
        fill
        sizes="100vw"
        className={`${
          thumbEnable ? "visible" : "hidden"
        } absolute h-full w-full object-cover`}
      />
      <video
        {...props}
        className="w-full h-full object-cover"
        ref={videoRef}
        muted
      />
    </div>
  );
};

export default VideoItem;
