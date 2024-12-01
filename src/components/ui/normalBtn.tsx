"use client";

interface NormalBtnProps {
  entity: any;
  clickEvt: () => void;
  type?: "submit" | "reset" | "button" | undefined;
}

const NormalBtn = ({ entity, clickEvt, type = "button" }: NormalBtnProps) => {
  return (
    <button
      type={type}
      onClick={clickEvt}
      className="w-full h-full flex justify-center items-center rounded-md  px-4 font-semibold blueBtn"
    >
      {entity}
    </button>
  );
};

export default NormalBtn;
