// src/services/api.ts
import axios, { AxiosError, AxiosHeaders } from 'axios';

/** ========= Base URL (dev/prod) =========
 * - Em dev local usa http://127.0.0.1:8000/api
 * - Em produção usa o mesmo domínio via /api (Nginx proxy)
 * - Se VITE_API_URL existir, tem prioridade
 */
const ENV_URL = (import.meta as any).env?.VITE_API_URL as string | undefined;

function computeBaseURL() {
  if (ENV_URL && ENV_URL.trim()) return ENV_URL.replace(/\/+$/, '');
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8000/api';
    }
  }
  return '/api';
}

export const baseURL = computeBaseURL();

const api = axios.create({
  baseURL,
  timeout: 60000,
  maxBodyLength: 10 * 1024 * 1024,
  maxContentLength: 10 * 1024 * 1024,
  headers: { Accept: 'application/json' }, // não fixa Content-Type p/ permitir uploads
});

// 🔄 Warm-up seguro (não depende de baseURL absoluta)
(() => {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (origin) {
      fetch(`${origin}/api/health`, { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
      fetch(`${origin}/health`, { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
    }
  } catch {}
})();

/** ========= Token helpers ========= */
export const TOKEN_KEY = 'nutriflow_token';

export function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common = {
      ...api.defaults.headers.common,
      Authorization: `Bearer ${token}`,
    };
  } else {
    localStorage.removeItem(TOKEN_KEY);
    if (api.defaults.headers?.common) delete api.defaults.headers.common.Authorization;
  }
}

// carrega token salvo
const existing = getToken();
if (existing) {
  api.defaults.headers.common = {
    ...api.defaults.headers.common,
    Authorization: `Bearer ${existing}`,
  };
}

// injeta Bearer por requisição
api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) {
    const headers = (config.headers ??= new AxiosHeaders());
    (headers as AxiosHeaders).set('Authorization', `Bearer ${t}`);
  }
  return config;
});

// trata 401 globalmente
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

/** ========= Login JSON (sempre POST) ========= */
export async function loginJson(username: string, password: string) {
  const { data } = await api.post('/user/login', { username, password });
  const token =
    (data as any)?.access_token || (data as any)?.token || (data as any)?.accessToken;
  if (!token) throw new Error('Token não retornado pelo servidor.');
  setToken(token);
  return data;
}

export default api;
