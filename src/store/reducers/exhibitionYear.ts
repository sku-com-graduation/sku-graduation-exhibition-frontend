import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: string = "";

const exhibitionYear = createSlice({
  name: "exhibitionYear",
  initialState,
  reducers: {
    setExhibitionYear: (state, action: PayloadAction<string>) => action.payload,
    clearExhibitionYear: () => initialState,
  },
});

export const { setExhibitionYear, clearExhibitionYear } = exhibitionYear.actions;
export default exhibitionYear.reducer;
