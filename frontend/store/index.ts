import { configureStore } from "@reduxjs/toolkit";
import roomReducer from "./slices/roomSlice";
import participantsReducer from "./slices/participantsSlice";
import chatReducer from "./slices/chatSlice";

export const store = configureStore({
  reducer: {
    room: roomReducer,
    participants: participantsReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;