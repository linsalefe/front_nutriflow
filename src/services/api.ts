// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://52.207.198.133/api',
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
