import {configureStore} from '@reduxjs/toolkit';
import activitiesReducer from './slices/activitiesSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    activities: activitiesReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;