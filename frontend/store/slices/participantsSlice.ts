import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export interface Participant {
  userName: string;
  socketId: string;
  color: string;
  cursor?: { line: number; column: number };
  isVideoOn?: boolean;
  isAudioOn?: boolean;
}

interface ParticipantsState {
  participants: Participant[];
}

const participantsSlice = createSlice({
  name: "participants",
  initialState: { participants: [] } as ParticipantsState,
  reducers: {
    setParticipants(state, action: PayloadAction<Participant[]>) {
      state.participants = action.payload;
    },
    addParticipant(state, action: PayloadAction<Participant>) {
      const exists = state.participants.find((p) => p.socketId === action.payload.socketId);
      if (!exists) state.participants.push(action.payload);
    },
    updateParticipantCursor(state, action: PayloadAction<{ socketId: string; cursor: { line: number; column: number } }>) {
      const p = state.participants.find((p) => p.socketId === action.payload.socketId);
      if (p) p.cursor = action.payload.cursor;
    },
    updateParticipantAudio: (state, action) => {
      const { socketId, isAudioOn } = action.payload;
      const user = state.participants.find(p => p.socketId === socketId);
      if (user) {user.isAudioOn = isAudioOn}
    },
    removeParticipant(state, action: PayloadAction<string>) {
      state.participants = state.participants.filter((p) => p.socketId !== action.payload);
    },
    clearParticipants(state) {
      state.participants = [];
    },
  },
});

export const { setParticipants, addParticipant, updateParticipantAudio, removeParticipant, clearParticipants, updateParticipantCursor } = participantsSlice.actions;
export default participantsSlice.reducer;