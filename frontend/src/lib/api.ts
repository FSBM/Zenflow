import { getToken } from './auth';

// Default backend port is 5000 in the repository server.js. Allow VITE_API_URL to override.
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
};

export type Project = {
  id: string;
  title: string;
  description?: string;
  tasksCompleted?: number;
  tasksTotal?: number;
  startDate?: string;
  endDate?: string;
  price?: number;
  [k: string]: unknown;
};

interface APIError extends Error {
  details?: unknown;
  status?: number;
}

async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  };

  // If body is an object and no explicit content-type set, assume JSON
  let body = options.body;
  if (body && !(body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let resp: Response;
  try {
    resp = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      // fetch expects BodyInit | null; cast here because we've already
      // serialized objects to JSON and left FormData untouched above
      body: body as BodyInit | null,
      signal: options.signal,
    });
  } catch (networkErr: unknown) {
    const err = new Error('Network request failed') as APIError;
    // attach some info for callers
    err.details = (networkErr as any)?.message ?? networkErr;
    err.status = 0;
    throw err;
  }

  // If fetch itself fails (network error), it will throw; catch and wrap to provide consistent error object

  if (!resp.ok) {
    const text = await resp.text();
    const err = new Error(`Request failed: ${resp.status} ${resp.statusText}`) as APIError;
    try {
      err.details = JSON.parse(text);
    } catch {
      err.details = text;
    }
    err.status = resp.status;
    throw err;
  }

  // Try to parse JSON, but return text if not JSON
  const contentType = resp.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await resp.json()) as T;
  }
  return (await resp.text()) as unknown as T;
}

async function upload(path: string, fileFieldName: string, file: File) {
  const url = `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const token = getToken();
  const form = new FormData();
  form.append(fileFieldName, file);

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers,
    body: form,
  });

  if (!resp.ok) {
    const text = await resp.text();
    let err: any = new Error(`Upload failed: ${resp.status} ${resp.statusText}`);
    try { err.details = JSON.parse(text); } catch { err.details = text; }
    err.status = resp.status;
    throw err;
  }

  return resp.json();
}

export { API_BASE, request, upload };

// Convenience API helpers tailored to the backend routes used by the UI.
const projects = {
  list: async (): Promise<Project[]> => request<Project[]>('/api/projects'),
  create: async (payload: { title: string; description?: string }) => request<{ project: Project }>('/api/projects', { method: 'POST', body: payload }),
  get: async (id: string) => request<{ project: Project; tasks?: unknown[]; notes?: unknown[] }>(`/api/projects/${id}`),
  update: async (id: string, payload: unknown) => request(`/api/projects/${id}`, { method: 'PATCH', body: payload }),
  delete: async (id: string) => request(`/api/projects/${id}`, { method: 'DELETE' }),
};

const tasks = {
  list: async (projectId: string, query?: Record<string, unknown>) => {
    let qs = '';
    if (query) {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => { if (v !== undefined && v !== null) params.set(k, String(v)); });
      qs = params.toString() ? `?${params.toString()}` : '';
    }
    return request(`/api/projects/${projectId}/tasks${qs}`) as Promise<unknown[]>;
  },
  create: async (projectId: string, payload: unknown) => request(`/api/projects/${projectId}/tasks`, { method: 'POST', body: payload }),
  update: async (taskId: string, payload: unknown) => request(`/api/tasks/${taskId}`, { method: 'PATCH', body: payload }),
  delete: async (taskId: string) => request(`/api/tasks/${taskId}`, { method: 'DELETE' }),
};

const notes = {
  list: async (projectId: string) => request(`/api/projects/${projectId}/notes`),
  create: async (projectId: string, body: string) => request(`/api/projects/${projectId}/notes`, { method: 'POST', body: { body } }),
  delete: async (noteId: string) => request(`/api/notes/${noteId}`, { method: 'DELETE' }),
};

const uploads = {
  uploadFile: async (fileFieldName: string, file: File) => upload('/api/uploads', fileFieldName, file),
};

export { projects, tasks, notes, uploads };
