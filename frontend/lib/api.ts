import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

function resolveApiBase(): string {
  // Em runtime do navegador, derive do host atual (evita host interno do Docker)
  if (typeof window !== 'undefined') {
    const env = (process.env.NEXT_PUBLIC_API_BASE || '').trim();
    if (env) {
      try {
        const u = new URL(env);
        // Normaliza host quando apontar para nome interno de rede
        const host = u.hostname === 'backend' ? 'localhost' : u.hostname;
        return `${u.protocol}//${host}${u.port ? `:${u.port}` : ''}`;
      } catch {
        // ignora parse e cai para fallback
      }
    }
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname || 'localhost'}:8000`;
  }
  // Em SSR/build, usar variável de ambiente (ex.: http://backend:8000)
  return process.env.NEXT_PUBLIC_API_BASE || 'http://backend:8000';
}

export const API_BASE = resolveApiBase();
// Em navegador roteamos via proxy do Next (/api/proxy) para evitar CORS
const useProxy = typeof window !== 'undefined';
export const api = axios.create({ baseURL: (useProxy ? '' : API_BASE) + '/api' + (useProxy ? '/proxy' : ''), withCredentials: true });

// Autenticação via cookie HttpOnly (withCredentials)
api.interceptors.request.use((config: InternalAxiosRequestConfig)=>{
  return config;
});

// Redireciona para login em respostas 401 (não autenticado)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error?.response?.status;
    if (typeof window !== 'undefined' && status === 401) {
      const path = window.location.pathname || '';
      if (!path.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
