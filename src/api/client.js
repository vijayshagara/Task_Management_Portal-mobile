import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://task-management-portal-be.vercel.app/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});
