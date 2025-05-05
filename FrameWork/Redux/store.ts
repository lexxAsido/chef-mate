import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import preloaderReducer from './preloaderSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    preloader: preloaderReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
