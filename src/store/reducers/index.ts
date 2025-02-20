import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./auth";
import exhibitionYearReducer from "./exhibitionYear";

const rootReducer = combineReducers({
  auth: authReducer,
  exhibitionYear: exhibitionYearReducer,
});

export default rootReducer;
