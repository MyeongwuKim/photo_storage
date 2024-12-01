"use client";

import { useEffect, useState } from "react";
import TagItem from "./tagItem";

const TagInput = ({
  callback,
  defaultValue,
}: {
  callback?: (tags: string[]) => void;
  defaultValue?: string[];
}) => {
  const keypressEvt = (e: any) => {
    if (e.key == "Enter" || e.key == ",") {
      if (e.currentTarget && e.currentTarget?.textContent?.length! > 0) {
        setTags((prevTags) => {
          let isOverlap = false;
          for (let i = 0; i < prevTags.length; i++) {
            if (prevTags[i] == e.currentTarget?.textContent) {
              isOverlap = true;
              break;
            }
          }

          if (isOverlap) {
            (e.target as HTMLElement).innerText = "";
            return prevTags;
          }

          let newTags = [...prevTags];
          newTags.push((e.target as HTMLElement).innerText);
          (e.target as HTMLElement).innerText = "";
          return newTags;
        });
      }
      e.preventDefault();
    }
  };
  const [tags, setTags] = useState<string[]>([]);
  const [isFocus, setFocus] = useState<boolean>(false);
  const [placeHolder, setPlaceHolder] = useState<string>(
    "태그 입력후 엔터나 쉼표를 눌러보세요."
  );
  useEffect(() => {
    const tagInputItem = document.getElementById("tagInputItem");
    tagInputItem?.addEventListener("keypress", keypressEvt);
    return () => {
      tagInputItem?.removeEventListener("keypress", keypressEvt);
    };
  }, []);
  useEffect(() => {
    setTags(defaultValue ? defaultValue : []);
  }, [defaultValue]);
  useEffect(() => {
    if (tags.length <= 0) {
      let inputItem = document.getElementById("tagInputItem") as HTMLElement;
      keyupEvt(inputItem);
    }
  }, [tags]);
  const keyupEvt = (target: any) => {
    if (target.innerText.length! <= 0 && tags.length <= 0) {
      setPlaceHolder("태그 입력후 엔터나 쉼표를 눌러보세요.");
    } else {
      setPlaceHolder(`\u200b`);
    }
  };
  return (
    <div id="tagInputWrapper" className="w-full h-auto">
      <div
        style={{ minHeight: 54, maxHeight: 54 }}
        id="tagInput"
        onClick={(e: any) => {
          let ele = e.target as HTMLElement;
          if (ele.id == "tagInput") {
            (ele.lastChild as HTMLElement).click();
          } else if (ele.id == "tagInputItem") {
          }
          e.stopPropagation();
        }}
        onBlur={() => {}}
        className={`${
          isFocus
            ? "after:border-blue-500 ring-blue-500 dark:after:border-blue-500 dark:ring-blue-500 ring-1 outline-offset-2 outline-1"
            : ""
        }
      items-center cursor-text w-full outline-none p-2.5 overflow-auto
      text-sm border shadow-sm relative flex flex-wrap gap-1
      border-gray-300 dark:border-gray-600 scrollbar-hide
      bg-gray-50  text-gray-900
    dark:bg-gray-800 dark:text-white rounded-lg 
     dark:placeholder-gray-400`}
      >
        {tags.map((v, i) => (
          <TagItem
            callback={() => {
              setTags((prevTags) => {
                let newTags = [...prevTags];
                newTags.splice(i, 1);
                return newTags;
              });
            }}
            text={v}
            key={i}
          />
        ))}
        <span
          id="tagInputItem"
          onClick={(e: any) => {
            setFocus(true);
            const selection = window.getSelection();
            const newRange = document.createRange();
            newRange.selectNodeContents(e.target);
            newRange.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
          }}
          onBlur={() => {
            if (callback) callback(tags);
            setFocus(false);
          }}
          onKeyDown={(e) => {
            if (e.key == "Backspace") {
              if (
                e.currentTarget?.textContent?.length! <= 0 &&
                tags.length > 0
              ) {
                setTags((prevTags) => {
                  let newTags = [...prevTags];
                  newTags.pop();
                  return newTags;
                });
                e.preventDefault();
              }
            }
          }}
          onKeyUp={(e) => {
            keyupEvt(e.target);
          }}
          aria-placeholder={placeHolder}
          onInput={(e) => {}}
          contentEditable={true}
          className="relative w-auto h-auto outline-none break-words inline-block bg-transparent"
        />
      </div>
    </div>
  );
};

export default TagInput;
