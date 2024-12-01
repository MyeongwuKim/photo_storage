"use client";

import { starRatingTheme } from "@/hooks/useFlowTheme";
import { BlobOptions } from "buffer";
import { Rating } from "flowbite-react";
import { useEffect, useState } from "react";

const StarRating = ({
  readonly,
  callback,
  defaultValue,
}: {
  readonly: boolean;
  defaultValue: number;
  callback?: (score: number) => void;
}) => {
  const [starActive, setStartActive] = useState<boolean[]>([
    true,
    true,
    true,
    true,
    true,
  ]);
  useEffect(() => {
    clickEvt(defaultValue - 1);
  }, [defaultValue]);
  const clickEvt = (index: number) => {
    if (callback) callback(index + 1);
    let stars = starActive.map((v, i) => {
      if (index >= i) {
        return true;
      }
      return false;
    });
    setStartActive(stars);
  };
  return (
    <Rating
      size={"md"}
      theme={{
        root: {
          base: "flex items-center",
        },
        star: {
          empty: "text-gray-300 dark:text-gray-500",
          filled: "text-yellow-400",
          sizes: {
            sm: "h-5 w-5",
            md: "h-7 w-7",
            lg: "h-10 w-10",
          },
        },
      }}
    >
      {starActive.map((v, i) => (
        <div
          key={i}
          className={`${readonly ? "" : "cursor-pointer"}`}
          onClick={() => {
            if (!readonly) clickEvt(i);
          }}
        >
          <StartItem readonly={readonly} isActive={v} />
        </div>
      ))}
    </Rating>
  );
};

const StartItem = ({
  isActive,
  readonly,
}: {
  isActive: boolean;
  readonly: boolean;
}) => {
  return (
    <Rating.Star
      className={`${readonly ? "" : "hover:animate-bounce"}`}
      filled={isActive}
    />
  );
};
export default StarRating;
