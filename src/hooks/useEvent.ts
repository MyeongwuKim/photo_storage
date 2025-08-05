import { Dispatch, ReactNode, SetStateAction } from "react";

let loadingActiveState: Dispatch<SetStateAction<boolean>>;
let loadingMsgState: Dispatch<SetStateAction<string>>;

export const registerLoadingState = (
  activestate: Dispatch<SetStateAction<boolean>>,
  msgstate: Dispatch<SetStateAction<string>>
) => {
  loadingActiveState = activestate;
  loadingMsgState = msgstate;
};

export const activeLoading = (isActive: boolean) => {
  loadingActiveState(isActive);
};

export const activeLoadingMsg = (msg: string) => {
  loadingMsgState(msg);
};
