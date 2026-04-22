import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchStats } from "../api/client";

export const loadStats = createAsyncThunk("stats/load", async (statsCode: string) => {
  const result = await fetchStats(statsCode);
  return result;
});

const statsSlice = createSlice({
  name: "stats",
  initialState: {
    loading: false,
    error: null,
    data: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadStats.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(loadStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load stats";
      });
  },
});

export default statsSlice.reducer;
