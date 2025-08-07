"use client";

import { useEffect, useState } from "react";
import TagItem from "./tagItem";
import { UseFormRegisterReturn } from "react-hook-form";

interface TagInputProps {
  callback?: (tags: string[]) => void;
  defaultValue?: string[];
  register: UseFormRegisterReturn;
}

const TagInput = ({ callback, defaultValue, register }: TagInputProps) => {
  const [tags, setTags] = useState<string[]>([]);
  const [isFocus, setFocus] = useState<boolean>(false);
  const [placeHolder, setPlaceHolder] = useState<string>(
    "태그 입력후 엔터나 쉼표를 눌러보세요."
  );

  useEffect(() => {}, []);
  useEffect(() => {
    setTags(defaultValue ? defaultValue : []);
  }, [defaultValue]);

  return (
    <div
      id="tagInputWrapper"
      className={`${
        isFocus
          ? "after:border-blue-500 ring-blue-500 dark:after:border-blue-500 dark:ring-blue-500 ring-1 outline-offset-2 outline-1"
          : ""
      }
        p-2.5 w-full min-h-[58px] flex flex-wrap gap-2 items-start border
border-gray-300 shadow-sm rounded-lg dark:border-gray-600 bg-gray-50
 dark:bg-gray-800 `}
    >
      {tags.map((v, i) => (
        <TagItem
          key={i}
          text={v}
          callback={() => {
            setTags((prevTags) => {
              const newTags = [...prevTags];
              newTags.splice(i, 1);
              return newTags;
            });
          }}
        />
      ))}
      <input
        {...register}
        onBlur={() => {
          if (callback) callback(tags);
          setFocus(false);
        }}
        id="tagInputItem"
        onKeyDown={(e: any) => {
          if (e.key === "Backspace") {
            if (e.target.value?.length <= 0 && tags.length > 0) {
              setTags((prevTags) => {
                const newTags = [...prevTags];
                newTags.pop();
                return newTags;
              });
              e.preventDefault();
            }
          } else if (e.key === "Enter") {
            if (e.target.value?.length > 0) {
              setTags((prevTags) => {
                if (prevTags.includes(e.target.value)) {
                  e.target.value = "";
                  return prevTags;
                }

                const newTags = [...prevTags, e.target.value];
                e.target.value = "";
                return newTags;
              });
            }
            e.preventDefault();
          }
        }}
        onClick={(e: any) => {
          e.target.focus();
          setFocus(true);
        }}
        placeholder={"태그를 입력하세요."}
        className="dark:placeholder-gray-400 text-sm dark:text-white text-gray-900 h-[34px] flex-grow min-w-[8rem] outline-none bg-transparent text-text1"
      />
    </div>
  );
};

export default TagInput;
