import { configureStore } from '@reduxjs/toolkit';

import authReducer from '@/features/auth/store/auth.slice';
import localeReducer from '@/features/i18n/store/locale.slice';
import notificationsReducer from '@/features/notifications/store/notifications.slice';
import sectionReducer from '@/features/section/store/section.slice';
import themeReducer from '@/features/theme/store/theme.slice';
import wishlistReducer from '@/features/wishlist/store/wishlist.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    locale: localeReducer,
    notifications: notificationsReducer,
    section: sectionReducer,
    theme: themeReducer,
    wishlist: wishlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
