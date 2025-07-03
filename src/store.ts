import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './slice/sessionSlice';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
  },
});

// Infer types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
