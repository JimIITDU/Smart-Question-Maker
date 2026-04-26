import { configureStore } from '@reduxjs/toolkit';
import questionReducer from './questionSlice';
import documentReducer from './documentSlice';

export const store = configureStore({
  reducer: {
    questions: questionReducer,
    documents: documentReducer,
  },
});