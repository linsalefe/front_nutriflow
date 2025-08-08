// src/services/api.ts
import axios, { AxiosHeaders } from 'axios';

const baseURL =
  (import.meta as any).env?.VITE_API_URL ||
  'https://back-nutriflow-ycr2.onrender.com/api';

const api = axios.create({
  baseURL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // garante tipo correto para headers no Axios v1+
    const headers = (config.headers ??= new AxiosHeaders());
    (headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

export default api;
