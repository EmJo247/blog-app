import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type FakeSession = {
  user: {
    email: string;
  };
};

type SessionState = {
  session: FakeSession | null;
};

const initialState: SessionState = {
  session: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<FakeSession>) {
      state.session = action.payload;
    },
    clearSession(state) {
      state.session = null;
    },
  },
});

export const { setSession, clearSession } = sessionSlice.actions;

export default sessionSlice.reducer;
