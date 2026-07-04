import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logout } from '../features/auth/authSlice';
import cowReducer from '../features/cows/cowSlice';
import healthReducer from '../features/health/healthSlice';
import heatCycleReducer from '../features/heatCycles/heatCycleSlice';
import taskReducer from '../features/tasks/taskSlice';
import userReducer from '../features/users/userSlice';
import feedReducer from '../features/social/feedSlice';
import profileReducer from '../features/social/profileSlice';
import marketplaceReducer from '../features/social/marketplaceSlice';
import messagesReducer from '../features/social/messagesSlice';
import notificationsReducer from '../features/social/notificationsSlice';
import { api } from '../api/client';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cows: cowReducer,
    health: healthReducer,
    heatCycles: heatCycleReducer,
    tasks: taskReducer,
    users: userReducer,
    feed: feedReducer,
    profile: profileReducer,
    marketplace: marketplaceReducer,
    messages: messagesReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth?.token;
  if (
    token &&
    !config.url?.includes('/auth/login') &&
    !config.url?.includes('/auth/register')
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);
