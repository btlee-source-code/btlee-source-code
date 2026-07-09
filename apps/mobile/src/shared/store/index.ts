import { configureStore } from '@reduxjs/toolkit';

import authReducer from '@/features/auth/store/auth.slice';
import wishlistReducer from '@/features/wishlist/store/wishlist.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wishlist: wishlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
