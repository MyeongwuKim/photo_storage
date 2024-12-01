"use client";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface TagItemProps {
  text: string;
  callback?: () => void;
  readonly?: boolean;
  textsize?: string;
}

const TagItem = ({ text, callback, readonly, textsize }: TagItemProps) => {
  return (
    <div
      className="p-1.5 rounded-lg  w-auto relative inline-block mr-1
    bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900 
    group-hover:bg-blue-200 dark:group-hover:bg-blue-300"
    >
      <span
        className={`${textsize ? textsize : "text-sm"} font-semibold relative`}
      >
        {text}
      </span>
      {readonly ? (
        ""
      ) : (
        <XMarkIcon
          onClick={() => {
            if (callback) callback();
          }}
          className={`cursor-pointer w-3 h-3 relative inline-block`}
        />
      )}
    </div>
  );
};

export default TagItem;
