// src/services/api.ts
import axios, { AxiosHeaders } from 'axios';

const baseURL =
  ((import.meta as any).env?.VITE_API_URL?.toString() || 'http://34.192.147.6/api')
    .replace(/\/+$/, ''); // remove barra final

const api = axios.create({
  baseURL,
  timeout: 30000,
});

// 🔥 Warm-up do backend (evita CORS da página "waking up" do Render)
(() => {
  try {
    const origin = new URL(baseURL).origin;
    fetch(`${origin}/api/health`, { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
    fetch(`${origin}/health`, { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
  } catch {}
})();

// Injeta token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    const headers = (config.headers ??= new AxiosHeaders());
    (headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Trata 401
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
