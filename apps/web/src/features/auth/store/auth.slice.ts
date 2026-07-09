/**
 * Auth Slice (Redux Toolkit)
 *
 * Holds only the current user. Auth tokens are NOT stored here (or anywhere in
 * JS) — they live in httpOnly cookies the browser manages, so XSS can't steal
 * them. The persisted user object is non-sensitive and just speeds up first
 * paint; the server (via /users/me) remains the source of truth.
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import type { User } from '@/shared/types/user';

interface AuthState {
  user: User | null;
  isHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  isHydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    // Flip isHydrated once redux-persist finishes rehydrating this slice
    // (matches the old Zustand setHydrated callback).
    // redux-persist tags every REHYDRATE action with the persistConfig key,
    // not the reducer slot. Match the same key used in store/index.ts.
    builder.addCase(REHYDRATE, (state, action: { type: typeof REHYDRATE; key?: string }) => {
      if (action.key === 'btlee-auth') state.isHydrated = true;
    });
  },
});

export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;
export type { AuthState };
