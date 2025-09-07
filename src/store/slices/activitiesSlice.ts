import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Activity {
  id: string;
  date: string;
  startTime?: string;
  stopTime?: string;
  duration: number;
  distance: string;
  type: string;
  userId?: string;
}

interface ActivitiesState {
  list: Activity[];
  currentActivity: Activity | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ActivitiesState = {
  list: [],
  currentActivity: null,
  isLoading: false,
  error: null,
};

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    addActivity: (state, action: PayloadAction<Activity>) => {
      state.list.unshift(action.payload);
    },
    setActivities: (state, action: PayloadAction<Activity[]>) => {
      state.list = action.payload;
    },
    setCurrentActivity: (state, action: PayloadAction<Activity | null>) => {
      state.currentActivity = action.payload;
    },
    updateActivity: (state, action: PayloadAction<Activity>) => {
      const index = state.list.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deleteActivity: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(a => a.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addActivity,
  setActivities,
  setCurrentActivity,
  updateActivity,
  deleteActivity,
  setLoading,
  setError,
} = activitiesSlice.actions;

export default activitiesSlice.reducer;