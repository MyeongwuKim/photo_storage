"use client";
import { configureStore, Action, ThunkAction } from "@reduxjs/toolkit";
import { toastSlice } from "../reducer/ui/toastReducer";
import { createWrapper } from "next-redux-wrapper";
import { modalSlice } from "../reducer/ui/modalReducer";
import { loadingSlice } from "../reducer/ui/loadingReducer";

export const makeStore = () =>
  configureStore({
    reducer: {
      toastReducer: toastSlice.reducer,
      modalReducer: modalSlice.reducer,
      loadingRecuer: loadingSlice.reducer,
    },
    // Redux DevTools를 개발 환경에서만 활성화합니다.
    devTools: true,
  });

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const wrapper = createWrapper<AppStore>(makeStore);
