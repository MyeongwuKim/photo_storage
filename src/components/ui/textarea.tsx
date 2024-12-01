"use client";

import { textareaTheme } from "@/hooks/useFlowTheme";
import { Label, Textarea } from "flowbite-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface TextBoxProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  rows?: number;
  commentState?: Dispatch<SetStateAction<string>>;
  defaultValue?: string;
}

const TextBox = ({
  register,
  placeholder,
  rows = 4,
  commentState,
  defaultValue,
}: TextBoxProps) => {
  useEffect(() => {}, [defaultValue]);
  return (
    <Textarea
      color={"gray"}
      theme={textareaTheme}
      style={{ scrollbarWidth: "none" }}
      className="W-full h-full resize-none placeholder-gray-500 text-sm"
      onClick={(e: any) => e.target.focus()}
      {...register}
      defaultValue={defaultValue}
      placeholder={placeholder}
      shadow={true}
    />
  );
};

export default TextBox;
