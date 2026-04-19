import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createLink } from "../api/client";

export const createShortLink = createAsyncThunk("links/create", async (url) => {
  const result = await createLink(url);
  return result;
});

const linksSlice = createSlice({
  name: "links",
  initialState: {
    loading: false,
    error: null,
    createdLink: null,
  },
  reducers: {
    clearCreatedLink(state) {
      state.createdLink = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createShortLink.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createShortLink.fulfilled, (state, action) => {
        state.loading = false;
        state.createdLink = action.payload;
      })
      .addCase(createShortLink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create link";
      });
  },
});

export const { clearCreatedLink } = linksSlice.actions;
export default linksSlice.reducer;
