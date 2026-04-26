import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { generateQuestions, getSession } from '../api/aiQuestionApi';

export const fetchGenerateQuestions = createAsyncThunk(
  'questions/generate',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await generateQuestions(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchSession = createAsyncThunk(
  'questions/fetchSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const { data } = await getSession(sessionId);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const questionSlice = createSlice({
  name: 'questions',
  initialState: {
    session: null,
    currentIndex: 0,
    answers: {},
    loading: false,
    error: null,
  },
  reducers: {
    setAnswer: (state, action) => {
      state.answers[action.payload.questionId] = action.payload.answer;
    },
    nextQuestion: (state) => {
      state.currentIndex = Math.min(
        state.currentIndex + 1,
        (state.session?.questions?.length || 1) - 1
      );
    },
    prevQuestion: (state) => {
      state.currentIndex = Math.max(state.currentIndex - 1, 0);
    },
    setIndex: (state, action) => {
      const len = state.session?.questions?.length || 0;
      const idx = action.payload;
      if (idx >= 0 && idx < len) {
        state.currentIndex = idx;
      }
    },
    resetSession: (state) => {
      state.session = null;
      state.currentIndex = 0;
      state.answers = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGenerateQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGenerateQuestions.fulfilled, (state, action) => {
        state.session = action.payload;
        state.currentIndex = 0;
        state.answers = {};
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchGenerateQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.session = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAnswer, nextQuestion, prevQuestion, setIndex, resetSession } = questionSlice.actions;
export default questionSlice.reducer;