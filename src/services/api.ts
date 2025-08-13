// src/services/api.ts
import axios, { AxiosError, AxiosHeaders } from 'axios';

const baseURL =
  ((import.meta as any).env?.VITE_API_URL?.toString() ||
    'https://nutriflow-api.duckdns.org/api')
    .replace(/\/+$/, '');

const api = axios.create({
  baseURL,
  timeout: 60000,
  maxBodyLength: 10 * 1024 * 1024,
  maxContentLength: 10 * 1024 * 1024,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 🔄 Warm-up (útil p/ ambientes que “acordam”)
(() => {
  try {
    const origin = new URL(baseURL).origin;
    fetch(`${origin}/api/health`, { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
    fetch(`${origin}/health`, { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
  } catch {}
})();

// ===== Helpers de Token =====
const TOKEN_KEY = 'token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
  }
}

// Carrega token salvo ao iniciar
const existing = getToken();
if (existing) {
  api.defaults.headers.common.Authorization = `Bearer ${existing}`;
}

// Injeta Bearer em cada request
api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) {
    const headers = (config.headers ??= new AxiosHeaders());
    (headers as AxiosHeaders).set('Authorization', `Bearer ${t}`);
  }
  return config;
});

// Trata 401 globalmente
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      setToken(null);
      console.warn('Sessão inválida/expirada (401).');
    }
    return Promise.reject(err);
  }
);

// ===== Login em JSON (use na tela de login) =====
export async function loginJson(username: string, password: string) {
  const { data } = await api.post('/user/login', { username, password });
  const token = (data as any)?.access_token;
  if (!token) throw new Error('Token não retornado pelo servidor.');
  setToken(token);
  return data;
}

export default api;
