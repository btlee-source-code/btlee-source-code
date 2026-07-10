import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Only the unread count lives in state — enough to drive the header bell badge. */
interface NotificationsState {
  unreadCount: number;
}

const initialState: NotificationsState = { unreadCount: 0 };

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = Math.max(0, action.payload);
    },
    decrementUnread(state) {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    clearUnread(state) {
      state.unreadCount = 0;
    },
  },
});

export const notificationsActions = notificationsSlice.actions;
export default notificationsSlice.reducer;
