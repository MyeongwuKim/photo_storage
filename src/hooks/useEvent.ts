import { Dispatch, ReactNode, SetStateAction } from "react";

interface ToastProps {
  msg: string;
  isWarning: boolean | null;
  index: number;
  time?: number;
}

let toastsState: Dispatch<SetStateAction<ToastProps[]>>;
let modalsState: Dispatch<SetStateAction<ReactNode[]>>;
let loadingActiveState: Dispatch<SetStateAction<boolean>>;
let loadingMsgState: Dispatch<SetStateAction<string>>;

export const registerLoadingState = (
  activestate: Dispatch<SetStateAction<boolean>>,
  msgstate: Dispatch<SetStateAction<string>>
) => {
  loadingActiveState = activestate;
  loadingMsgState = msgstate;
};
export const registToastsState = (
  state: Dispatch<SetStateAction<ToastProps[]>>
) => {
  toastsState = state;
};

export const registModalsState = (
  state: Dispatch<SetStateAction<ReactNode[]>>
) => {
  modalsState = state;
};

export const createToast = (
  msg: string,
  isWarning: boolean | null,
  time?: number
) => {
  let lastToast = document.getElementById("toastWrapper")
    ?.lastChild as HTMLElement;
  let number = lastToast
    ? Number(lastToast.id.replace("_toastContainer", "")) + 1
    : 0;

  let toastInfo = { msg, isWarning, index: number };
  toastsState((prev) => {
    let newPrev = [...prev];
    newPrev.push(toastInfo);
    return newPrev;
  });
};

export const createModal = (node: ReactNode) => {
  modalsState((prev) => {
    let newPrev = [...prev];
    newPrev.push(node);
    return newPrev;
  });
};

export const removeModal = () => {
  modalsState((prev) => {
    let newPrev = [...prev];
    newPrev.splice(newPrev.length - 1, 1);
    return newPrev;
  });
};

export const activeLoading = (isActive: boolean) => {
  loadingActiveState(isActive);
};

export const activeLoadingMsg = (msg: string) => {
  loadingMsgState(msg);
};
