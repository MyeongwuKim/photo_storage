"use client";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
} from "react";
import { addToast, removeToast } from "@/redux/reducer/ui/toastReducer";
import { active, deActive } from "@/redux/reducer/ui/loadingReducer";
import {
  addModal,
  ModalPropsMap,
  ModalType,
  removeModal,
} from "@/redux/reducer/ui/modalReducer";
import Toast from "./popup/toast/toast";
import { v4 as uuidv4 } from "uuid"; // uuid 라이브러리 임포트
import UploadModal from "./popup/modal/uploadModal";
import { modalManager } from "@/lib/modalManager";
import AlertModal from "./popup/modal/alertModal";
import MapModal from "./popup/modal/mapmodal";
import DatePickerModal from "./popup/modal/datePickerModal";
import GlobalLoading from "./loading/globalLoading";

// 2. Context 타입 정의 (제네릭으로 통일)
type PopupContextType = {
  openToast: (isWarning: boolean, msg: string, time: number) => void;
  openModal: <T extends ModalType>(
    type: T,
    props?: ModalPropsMap[T]
  ) => Promise<any>;
  activeLoading: (isActive: boolean, msg?: string) => void;
};

const MODAL_MAP: {
  [K in ModalType]: (
    props: ModalPropsMap[K],
    onClose: (result?: any) => void
  ) => ReactNode;
} = {
  DATEPICKER: (props, onClose) => (
    <DatePickerModal date={props.date} onClose={onClose} />
  ),
  UPLOAD: (props, onClose) => (
    <UploadModal onClose={onClose} postId={props?.postId} />
  ),
  ALERT: (props, onClose) => (
    <AlertModal
      msg={props.msg}
      btnMsg={props.btnMsg}
      title={props.title}
      onClose={onClose}
    />
  ),
  MAP: (_props, onClose) => <MapModal onClose={onClose} />,
};

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const toastItems = useAppSelector((state) => state.toastReducer.toastItem);
  const modalItems = useAppSelector((state) => state.modalReducer.modalItem);
  const loadingObj = useAppSelector((state) => state.loadingRecuer.obj);

  const dispatch = useAppDispatch();

  const openToast = useCallback(
    (isWarning: boolean, msg: string, time: number) => {
      dispatch(addToast({ isWarning, msg, time }));
    },
    [dispatch]
  );

  const openModal: PopupContextType["openModal"] = async (
    type,
    props
  ): Promise<any> => {
    const id = uuidv4();
    dispatch(addModal({ type, id, props }));
    const result = await modalManager.openModal(id);
    return result;
  };

  const activeLoading = useCallback(
    (isActive: boolean, msg?: string) => {
      if (isActive) dispatch(active({ msg: msg ? msg : "" }));
      else dispatch(deActive());
    },
    [dispatch]
  );

  const value: PopupContextType = { openToast, openModal, activeLoading };

  const handleClose = (id: string) => (result?: any) => {
    dispatch(removeModal(id));
    modalManager.closeModal(id, result); // 여기서 결과 전달
  };

  return (
    <PopupContext.Provider value={value}>
      {children}
      {modalItems.map((v) => {
        const onClose = handleClose(v.id);
        let content = null;
        switch (v.type) {
          case "ALERT":
            content = MODAL_MAP.ALERT(
              v.props as ModalPropsMap["ALERT"],
              onClose
            );
            break;
          case "DATEPICKER":
            content = MODAL_MAP.DATEPICKER(
              v.props as ModalPropsMap["DATEPICKER"],
              onClose
            );
            break;
          case "UPLOAD":
            content = MODAL_MAP.UPLOAD(
              v.props as ModalPropsMap["UPLOAD"],
              onClose
            );
            break;
          case "MAP":
            content = MODAL_MAP.MAP(undefined, onClose);
            break;
        }
        return <div key={v.id}>{content}</div>;
      })}
      {toastItems.length > 0 && (
        <div
          id="toastWrapper"
          className="pointer-events-none flex-wrap justify-start gap-2
        fixed w-full h-full flex flex-col left-0 top-0"
        >
          {toastItems.map((v) => (
            <Toast
              key={v.id}
              time={v.time}
              isWarning={v.isWarning}
              msg={v.msg}
              id={v.id}
              toastArrHandler={() => {
                dispatch(removeToast(v.id));
              }}
            />
          ))}
        </div>
      )}
      {loadingObj.isActive && <GlobalLoading msg={loadingObj.msg} />}
    </PopupContext.Provider>
  );
};

// 3. useUI Hook
export const useUI = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};
