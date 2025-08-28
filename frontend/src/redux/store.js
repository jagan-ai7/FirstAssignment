// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slice/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer, // Add your slice reducer(s) here
  },
});
