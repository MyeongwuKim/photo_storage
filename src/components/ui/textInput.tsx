"use client";
import {
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
} from "react-hook-form";
import { ChangeEvent, InputHTMLAttributes } from "react";
import { TextInput as FBTextInput } from "flowbite-react";
import { HomeIcon } from "@heroicons/react/20/solid";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string; // RHF용 필드 이름
  value: string; // Controlled value
  register: UseFormRegister<any>; // RHF register
  errors: FieldErrors; // RHF errors
  clearErrors: UseFormClearErrors<any>; // RHF clearErrors
  setValue: (value: string) => void; // 부모 상태 갱신
  className?: string; // 커스텀 스타일
}

export default function TextInput({
  name,
  value,
  register,
  errors,
  clearErrors,
  setValue,
  className = "",
  ...rest // placeholder, id, autoComplete, type 등 기본 속성 전부 지원
}: TextInputProps) {
  const hasError = Boolean(errors?.[name]?.message);
  return (
    <FBTextInput
      color={errors?.[name]?.message ? "failure" : "gray"}
      theme={{
        field: {
          input: {
            base: `
          block w-full h-full rounded-lg transition-colors
          focus:outline-none disabled:cursor-not-allowed disabled:opacity-50
        `,
            colors: {
              failure: `
            !ring-2 !ring-red-600 placeholder-red-600
            !focus:ring-2 !focus:ring-red-600 !focus:border-red-600 !border-red-600
          `,
            },
          },
        },
      }}
      {...register(name, {
        required: { value: true, message: "내용을 입력해주세요." },
      })}
      className={className}
      value={value}
      onChange={(e) => {
        if (errors?.[name]?.message) clearErrors(name);
        setValue(e.target.value);
      }}
      placeholder={
        errors?.[name]?.message
          ? (errors[name]?.message as string)
          : rest.placeholder
      }
    />
  );
}
