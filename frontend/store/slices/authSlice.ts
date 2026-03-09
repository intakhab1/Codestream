import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
