import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Section } from '@/config/theme';

/**
 * The active platform "section" — `properties` or `cars`. Orthogonal to the
 * light/dark theme mode. Driven by the top switcher; read by the theming layer
 * (useThemeColors + SectionBrandProvider) and the Logo to swap branding.
 */
interface SectionState {
  section: Section;
}

const initialState: SectionState = { section: 'properties' };

const sectionSlice = createSlice({
  name: 'section',
  initialState,
  reducers: {
    setSection(state, action: PayloadAction<Section>) {
      state.section = action.payload;
    },
  },
});

export const sectionActions = sectionSlice.actions;
export default sectionSlice.reducer;
