import {
  Action,
  configureStore,
  ThunkAction,
} from '@reduxjs/toolkit';
import utilReducer from './slices/utilSlice';

export const store = configureStore({
  reducer: {
    util: utilReducer
  },
});