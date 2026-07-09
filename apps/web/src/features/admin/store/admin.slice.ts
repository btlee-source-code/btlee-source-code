/**
 * Admin Auth Slice (Redux Toolkit) — separate from regular user auth.
 * Like the user slice, it holds only the admin object; tokens live in
 * httpOnly cookies (admin_* names) and are never exposed to JS.
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface AdminAuthState {
  admin: AdminUser | null;
  isHydrated: boolean;
}

const initialState: AdminAuthState = {
  admin: null,
  isHydrated: false,
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AdminUser>) => {
      state.admin = action.payload;
    },
    clearAuth: (state) => {
      state.admin = null;
    },
  },
  extraReducers: (builder) => {
    // redux-persist tags every REHYDRATE action with the persistConfig key,
    // not the reducer slot. Match the same key used in store/index.ts.
    builder.addCase(
      REHYDRATE,
      (state, action: { type: typeof REHYDRATE; key?: string }) => {
        if (action.key === 'btlee-admin-auth') state.isHydrated = true;
      }
    );
  },
});

export const adminAuthActions = adminAuthSlice.actions;
export const adminAuthReducer = adminAuthSlice.reducer;
export type { AdminAuthState, AdminUser };
