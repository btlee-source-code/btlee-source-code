import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { User } from '@/shared/types/user';

/**
 * Auth state. Mirrors the web `auth.slice` (only the non-sensitive user lives in
 * state — tokens stay in SecureStore, never in Redux). `status` starts as
 * 'loading' while we hydrate from a stored token on app start.
 */
export type AuthStatus = 'loading' | 'authenticated' | 'guest';

interface AuthState {
  user: User | null;
  status: AuthStatus;
}

const initialState: AuthState = { user: null, status: 'loading' };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = 'authenticated';
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.status = 'guest';
    },
    setGuest(state) {
      state.user = null;
      state.status = 'guest';
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
