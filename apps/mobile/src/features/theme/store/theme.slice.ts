import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ThemeMode } from '@/config/theme';

interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = { mode: 'light' };

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
  },
});

export const themeActions = themeSlice.actions;
export default themeSlice.reducer;
