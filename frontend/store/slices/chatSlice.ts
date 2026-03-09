import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "@/types";

interface ChatState {
  messages: Message[];
  isOpen: boolean;
  unreadCount: number;
}

const chatSlice = createSlice({
  name: "chat",
  initialState: { messages: [], isOpen: true, unreadCount: 0 } as ChatState,
  reducers: {
    setMessages(state, action: PayloadAction<Message[]>) { state.messages = action.payload; },
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
      if (!state.isOpen) state.unreadCount += 1;
    },
    setChatOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
      if (action.payload) state.unreadCount = 0;
    },
    clearChat(state) { state.messages = []; state.unreadCount = 0; },
  },
});

export const { setMessages, addMessage, setChatOpen, clearChat } = chatSlice.actions;
export default chatSlice.reducer;