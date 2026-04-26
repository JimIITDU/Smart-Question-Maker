import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axiosClient from '../api/axiosClient';
import { loginUser as loginUserAPI, registerUser as registerUserAPI, getProfile, logoutUser as logoutUserAPI } from '../api/authApi';

export const loginUser = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await loginUserAPI(creds);
    localStorage.setItem('accessToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await registerUserAPI(userData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const fetchProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await getProfile();
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await logoutUserAPI(refreshToken);
    }
    localStorage.clear();
    return { status: 'Successfully logged out' };
  } catch (err) {
    localStorage.clear();
    return rejectWithValue(err.response?.data);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => { 
        state.loading = false; 
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state) => { state.loading = false; })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.user = action.payload; })
      .addCase(logoutUser.pending, (state) => { state.loading = true; })
      .addCase(logoutUser.fulfilled, (state) => { 
        state.user = null; 
        state.loading = false; 
        state.error = null; 
      })
      .addCase(logoutUser.rejected, (state) => { 
        state.user = null; 
        state.loading = false; 
      });
  }
});

export default authSlice.reducer;