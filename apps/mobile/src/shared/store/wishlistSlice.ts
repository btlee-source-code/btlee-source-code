import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Just the saved property IDs live in state — enough to drive every heart icon. */
interface WishlistState {
  ids: string[];
  loaded: boolean;
}

const initialState: WishlistState = { ids: [], loaded: false };

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
    clearWishlist(state) {
      state.ids = [];
      state.loaded = false;
    },
  },
});

export const wishlistActions = wishlistSlice.actions;
export default wishlistSlice.reducer;
