import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoadingProps {
  msg?: string;
  isActive: boolean;
}

const initialState: { obj: LoadingProps } = {
  obj: {
    msg: "",
    isActive: false,
  },
};

export const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    active: (state, action: PayloadAction<Omit<LoadingProps, "isActive">>) => {
      state.obj = {
        ...state,
        isActive: true,
        ...action.payload,
      };
    },
    deActive: (state) => {
      state.obj = {
        ...state,
        ...initialState.obj,
      };
    },
  },
});

export const { active, deActive } = loadingSlice.actions;
export default loadingSlice.reducer;
