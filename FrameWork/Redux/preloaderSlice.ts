import { createSlice } from '@reduxjs/toolkit';

const preloaderSlice = createSlice({
  name: 'preloader',
  initialState: {
    isLoading: false,
  },
  reducers: {
    showPreloader: (state) => {
      state.isLoading = true;
    },
    hidePreloader: (state) => {
      state.isLoading = false;
    },
  },
});

export const { showPreloader, hidePreloader } = preloaderSlice.actions;
export default preloaderSlice.reducer;
