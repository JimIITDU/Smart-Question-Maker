import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import aiClient from '../api/aiClient';

export const fetchDocuments = createAsyncThunk(
  'documents/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await aiClient.get('/documents/');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const documentSlice = createSlice({
  name: 'documents',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => { state.loading = true; })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.list = action.payload.results || action.payload;
        state.loading = false;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default documentSlice.reducer;