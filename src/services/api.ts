import axios from 'axios';

const baseURL =
  (import.meta as any).env?.VITE_API_URL ||
  'https://back-nutriflow-ycr2.onrender.com/api'; // fallback prod
  // Para dev local, defina VITE_API_URL=http://localhost:8000/api

const api = axios.create({
  baseURL,
  timeout: 30000,
});

// Injeta o token antes de cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    (config.headers ??= {});
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Trata 401: limpa token
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