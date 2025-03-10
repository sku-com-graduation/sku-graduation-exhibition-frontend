import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IAuth } from "../../interface";

const initialState: IAuth = {
  accessToken: "",
  teamName: "",
  role: "",
};

const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<IAuth>) => {
      state.accessToken = action.payload.accessToken;
      state.teamName = action.payload.teamName;
      state.role = action.payload.role;
    },
    clearAuth: () => initialState,
  },
});

export const { setAuth, clearAuth } = auth.actions;
export default auth.reducer;
