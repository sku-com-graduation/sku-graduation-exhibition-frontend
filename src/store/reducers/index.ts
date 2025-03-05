import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./auth";
import exhibitionYearReducer from "./exhibitionYear";
// import initAllReducer from "./init";

const rootReducer = combineReducers({
  auth: authReducer,
  exhibitionYear: exhibitionYearReducer,
  // init: initAllReducer,
});

export default rootReducer;
