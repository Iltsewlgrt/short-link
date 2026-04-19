import { configureStore } from "@reduxjs/toolkit";
import linksReducer from "./store/linksSlice";
import statsReducer from "./store/statsSlice";

export const store = configureStore({
  reducer: {
    links: linksReducer,
    stats: statsReducer,
  },
});
