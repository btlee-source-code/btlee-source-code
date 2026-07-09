/**
 * Redux store — configures slices, persistence and DevTools.
 *
 * Each slice gets its own persistConfig (with the SAME localStorage key the
 * old Zustand stores used) so existing user sessions survive the migration.
 * Only the actual data field (`user` / `admin`) is whitelisted — the
 * `isHydrated` flag is recomputed at runtime via the REHYDRATE action.
 */
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { authReducer } from '@/features/auth/store/auth.slice';
import { adminAuthReducer } from '@/features/admin/store/admin.slice';

// redux-persist's default storage tries to touch `localStorage` at module
// load time, which crashes during Next.js SSR and falls back to a noop store
// (no writes ever land in the browser). Pick the right backend per
// environment: real localStorage on the client, a noop on the server.
const createNoopStorage = () => ({
  getItem(_key: string) {
    return Promise.resolve(null);
  },
  setItem(_key: string, value: unknown) {
    return Promise.resolve(value);
  },
  removeItem(_key: string) {
    return Promise.resolve();
  },
});

const storage =
  typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

// Same localStorage keys the Zustand persist middleware used. Keeping them
// identical means users who are already signed in stay signed in after the
// migration ships.
const authPersistConfig = {
  key: 'btlee-auth',
  storage,
  whitelist: ['user'],
};

const adminPersistConfig = {
  key: 'btlee-admin-auth',
  storage,
  whitelist: ['admin'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  adminAuth: persistReducer(adminPersistConfig, adminAuthReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) =>
    getDefault({
      // redux-persist dispatches non-serializable action payloads internally —
      // these are the canonical action types to ignore in the check.
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
