'use client';

import { Stream, StreamPlayerApi } from '@cloudflare/stream-react';
import React, { useEffect, useRef } from 'react';

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
   const videoRef = useRef<HTMLVideoElement>(null);

   useEffect(() => {
      if (process.env.NEXT_PUBLIC_DEMO) {
         const el = videoRef.current;
         if (!el) return;

         if (slideNumber === index) {
            el.play();
         } else {
            el.pause();
            el.currentTime = 0;
         }
         return;
      }

      // Cloudflare Stream 제어
      const el = streamRef.current;
      if (!el) return;

      if (slideNumber === index) {
         el.play();
      } else {
         el.pause();
         el.currentTime = 0;
      }
   }, [slideNumber, index]);

   const isDemo = process.env.NEXT_PUBLIC_DEMO;

   if (isDemo) {
      return (
         <video
            ref={videoRef}
            src={fileId}
            controls
            muted
            className="object-contain w-full h-full"
         />
      );
   }

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

export default React.memo(StreamItem);
