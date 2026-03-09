// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import { User } from "@/types";

// interface AuthState {
//   user: User | null;
//   token: string | null;
//   isLoading: boolean;
//   error: string | null;
//   isAuthenticated: boolean;
// }

// const initialState: AuthState = {
//   user: null,
// //   token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
//   token: null,
//   isLoading: false,
//   error: null,
//   isAuthenticated: false,
// };

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// export const registerUser = createAsyncThunk(
//   "auth/register",
//   async (credentials: { name: string; email: string; password: string }, { rejectWithValue }) => {
//     try {
//       const res = await fetch(`${API_URL}/api/auth/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(credentials),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);
//       return data as { token: string; user: User };
//     } catch (err: any) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const loginUser = createAsyncThunk(
//   "auth/login",
//   async (credentials: { email: string; password: string }, { rejectWithValue }) => {
//     try {
//       const res = await fetch(`${API_URL}/api/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(credentials),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);
//       return data as { token: string; user: User };
//     } catch (err: any) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const fetchCurrentUser = createAsyncThunk(
//   "auth/fetchMe",
//   async (_, { getState, rejectWithValue }) => {
//     try {
//       const state = getState() as { auth: AuthState };
//       const res = await fetch(`${API_URL}/api/auth/me`, {
//         headers: { Authorization: `Bearer ${state.auth.token}` },
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);
//       return data.user as User;
//     } catch (err: any) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     logout(state) {
//       state.user = null;
//       state.token = null;
//       state.isAuthenticated = false;
//       if (typeof window !== "undefined") localStorage.removeItem("token");
//     },
//     setToken(state, action: PayloadAction<string>) {
//       state.token = action.payload;
//     },
//     clearError(state) {
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null; })
//       .addCase(registerUser.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         state.isAuthenticated = true;
//         if (typeof window !== "undefined") localStorage.setItem("token", action.payload.token);
//       })
//       .addCase(registerUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

//     builder
//       .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         state.isAuthenticated = true;
//         if (typeof window !== "undefined") localStorage.setItem("token", action.payload.token);
//       })
//       .addCase(loginUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

//     builder
//       .addCase(fetchCurrentUser.fulfilled, (state, action) => {
//         state.user = action.payload;
//         state.isAuthenticated = true;
//         state.isLoading = false;
//       })
//       .addCase(fetchCurrentUser.rejected, (state) => {
//         state.token = null;
//         state.isAuthenticated = false;
//         if (typeof window !== "undefined") localStorage.removeItem("token");
//       });
//   },
// });

// export const { logout, setToken, clearError } = authSlice.actions;
// export default authSlice.reducer;