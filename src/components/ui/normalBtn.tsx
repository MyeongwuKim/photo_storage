"use client";

interface NormalBtnProps {
  entity: any;
  clickEvt: () => void;
  type?: "submit" | "reset" | "button" | undefined;
  className?: string;
}

const NormalBtn = ({
  entity,
  clickEvt,
  type = "button",
  className = "",
}: NormalBtnProps) => {
  return (
    <button
      type={type}
      onClick={clickEvt}
      className={`flex justify-center items-center rounded-md  px-4 font-semibold ${className} `}
    >
      {entity}
    </button>
  );
};

export default NormalBtn;
