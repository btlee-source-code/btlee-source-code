import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Saved property + car IDs live in state — enough to drive every heart icon. */
interface WishlistState {
  ids: string[];
  carIds: string[];
  loaded: boolean;
}

const initialState: WishlistState = { ids: [], carIds: [], loaded: false };

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist(state, action: PayloadAction<string[]>) {
      state.ids = action.payload;
      state.loaded = true;
    },
    addId(state, action: PayloadAction<string>) {
      if (!state.ids.includes(action.payload)) state.ids.push(action.payload);
    },
    removeId(state, action: PayloadAction<string>) {
      state.ids = state.ids.filter((id) => id !== action.payload);
    },
    setCarWishlist(state, action: PayloadAction<string[]>) {
      state.carIds = action.payload;
    },
    addCarId(state, action: PayloadAction<string>) {
      if (!state.carIds.includes(action.payload)) state.carIds.push(action.payload);
    },
    removeCarId(state, action: PayloadAction<string>) {
      state.carIds = state.carIds.filter((id) => id !== action.payload);
    },
    clearWishlist(state) {
      state.ids = [];
      state.carIds = [];
      state.loaded = false;
    },
  },
});

export const wishlistActions = wishlistSlice.actions;
export default wishlistSlice.reducer;
