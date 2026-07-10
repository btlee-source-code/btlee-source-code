import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Locale } from '@/config/locale';

/** The active UI language. Drives a navigator remount so screens re-read strings. */
interface LocaleState {
  locale: Locale;
}

const initialState: LocaleState = { locale: 'ar' };

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
    },
  },
});

export const localeActions = localeSlice.actions;
export default localeSlice.reducer;
