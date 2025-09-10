"use client";
import { ReactNode, memo } from "react";

interface ToggleButtonProps {
  checkIcon: ReactNode;
  unCheckIcon: ReactNode;
  isCheck: boolean; // 상태는 부모에서 제어
  clickCallback: (state: boolean) => void;
  className?: string;
}

function ToggleButtonComponent({
  checkIcon,
  unCheckIcon,
  isCheck,
  clickCallback,
  className = "",
}: ToggleButtonProps) {
  return (
    <button
      onClick={() => clickCallback(!isCheck)}
      className={`hover:bg-background3
      border-none rounded-lg cursor-pointer flex items-center justify-center text-text1 ${className}`}
    >
      {isCheck ? checkIcon : unCheckIcon}
    </button>
  );
}

// props가 바뀌지 않으면 리렌더링 안 함
export const ToggleButton = memo(ToggleButtonComponent);
