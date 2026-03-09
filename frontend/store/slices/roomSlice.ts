import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Room, Language } from "@/types";

interface RoomState {
  currentRoom: Room | null;
  rooms: Room[];
  isLoading: boolean;
  error: string | null;
  currentCode: string;
  currentLanguage: Language;
}

const initialState: RoomState = {
  currentRoom: null,
  rooms: [],
  isLoading: false,
  error: null,
  currentCode: "",
  currentLanguage: "javascript",
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRooms(state, action: PayloadAction<Room[]>) { state.rooms = action.payload; },
    setCurrentRoom(state, action: PayloadAction<Room | null>) {
      state.currentRoom = action.payload;
      if (action.payload) {
        state.currentCode = action.payload.code;
        state.currentLanguage = action.payload.language as Language;
      }
    },
    setCode(state, action: PayloadAction<string>) { state.currentCode = action.payload; },
    setLanguage(state, action: PayloadAction<Language>) { state.currentLanguage = action.payload; },
    setLoading(state, action: PayloadAction<boolean>) { state.isLoading = action.payload; },
    setError(state, action: PayloadAction<string | null>) { state.error = action.payload; },
    addRoom(state, action: PayloadAction<Room>) { state.rooms.unshift(action.payload); },
    removeRoom(state, action: PayloadAction<string>) { state.rooms = state.rooms.filter((r) => r.id !== action.payload); },
    clearRoom(state) { state.currentRoom = null; state.currentCode = ""; state.currentLanguage = "javascript"; },
  },
});

export const { setRooms, setCurrentRoom, setCode, setLanguage, setLoading, setError, addRoom, removeRoom, clearRoom } = roomSlice.actions;
export default roomSlice.reducer;