// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://back-nutriflow-ycr2.onrender.com/api',
});

// Antes de cada requisição, injeta o token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
