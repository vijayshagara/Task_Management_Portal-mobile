import axios from 'axios';
import { loadingTracker } from '../utils/loadingTracker';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://task-management-portal-be.vercel.app/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Pass `{ silent: true }` in a request config to skip the global loader.
api.interceptors.request.use((config) => {
  if (!config.silent) {
    config.__tracked = true;
    loadingTracker.start();
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.config?.__tracked) loadingTracker.stop();
    return response;
  },
  (error) => {
    if (error.config?.__tracked) loadingTracker.stop();
    return Promise.reject(error);
  },
);
