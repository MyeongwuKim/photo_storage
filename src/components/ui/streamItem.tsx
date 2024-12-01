"use client";

import { Stream, StreamPlayerApi } from "@cloudflare/stream-react";
import { useEffect, useRef } from "react";

const StreamItem = ({
  slideNumber,
  fileId,
  index,
}: {
  index: number;
  slideNumber: number;
  fileId: string;
}) => {
  const streamRef = useRef<StreamPlayerApi>();

  useEffect(() => {
    const playVideo = async () => {
      if (streamRef.current) await streamRef.current?.play();
    };
    if (streamRef.current) {
      if (slideNumber == index) playVideo();
      else {
        if (!streamRef.current.paused) {
          streamRef.current.currentTime = 0;
          streamRef.current.pause();
        }
      }
    }
  }, [streamRef, slideNumber, index]);
  return (
    <Stream
      streamRef={streamRef}
      width="100%"
      height="100%"
      responsive={false}
      controls
      className="object-contain w-full h-full"
      key={fileId}
      src={fileId}
    />
  );
};

export default StreamItem;
