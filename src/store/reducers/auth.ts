import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IAuth } from "../../interface";

const initialState: IAuth = {
  accessToken: "",
  teamName: "",
  role: "",
  uuid: "",
  recent: "",
};

const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<IAuth>) => {
      state.accessToken = action.payload.accessToken;
      state.teamName = action.payload.teamName;
      state.role = action.payload.role;
      state.uuid = action.payload.uuid;
      state.recent = action.payload.recent;
    },
    clearAuth: () => initialState,
  },
});

export const { setAuth, clearAuth } = auth.actions;
export default auth.reducer;
