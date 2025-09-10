import { useSearchParams } from "next/navigation";
import NormalBtn from "./normalBtn";

interface FallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

export default function ErrorComponent({
  fallbackProps: { error, resetErrorBoundary },
}: {
  fallbackProps: FallbackProps;
}) {
  const params = useSearchParams();
  return (
    <div
      className={`absolute w-full outline-none ${
        params.size >= 2 && params.get("filter") && params.get("s")
          ? "h-[calc(100%-70px)]"
          : "top-[108px] h-[calc(100%-108px)]"
      }
         overflow-auto p-2 overflow-x-hidden flex items-center justify-center flex-col`}
    >
      <div className="text-xl font-semibold">
        {error ? error.toString() : "예기치 못한 에러가 발생했습니다."}
      </div>

      <NormalBtn
        className="h-default w-[80px] mt-4 blueBtn"
        clickEvt={() => {
          resetErrorBoundary();
        }}
        entity={<span>재시도</span>}
      />
    </div>
  );
}
