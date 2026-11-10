// Thin typed fetch wrapper: one error shape for the whole app, no axios dependency needed.

import type {
  ApiFieldError,
  Note,
  Patient,
  PatientInput,
  PatientListParams,
  PatientPage,
  PatientSummary,
} from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "/api";

export class ApiError extends Error {
  status: number;
  fieldErrors: ApiFieldError[];

  constructor(status: number, message: string, fieldErrors: ApiFieldError[] = []) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    // fetch only throws on network-level failure; surface it distinctly from HTTP errors
    throw new ApiError(0, "Network error - is the API running?");
  }

  if (res.status === 204) return undefined as T;

  // the reverse proxy answers 502/503/504 when the API is down, so translate
  // gateway errors into the same human message as a network failure
  if (res.status === 502 || res.status === 503 || res.status === 504) {
    throw new ApiError(res.status, "The server is temporarily unavailable.");
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = body?.detail ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, detail, body?.errors ?? []);
  }
  return body as T;
}

export const api = {
  health: () => request<{ status: string }>("/health"),

  listPatients: (p: PatientListParams) => {
    const qs = new URLSearchParams({
      page: String(p.page),
      page_size: String(p.page_size),
      sort_by: p.sort_by,
      sort_dir: p.sort_dir,
    });
    if (p.search) qs.set("search", p.search);
    if (p.status) qs.set("status", p.status);
    return request<PatientPage>(`/patients?${qs}`);
  },

  getPatient: (id: number) => request<Patient>(`/patients/${id}`),
  createPatient: (data: PatientInput) =>
    request<Patient>("/patients", { method: "POST", body: JSON.stringify(data) }),
  updatePatient: (id: number, data: PatientInput) =>
    request<Patient>(`/patients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePatient: (id: number) => request<void>(`/patients/${id}`, { method: "DELETE" }),

  listNotes: (patientId: number) => request<Note[]>(`/patients/${patientId}/notes`),
  createNote: (patientId: number, content: string) =>
    request<Note>(`/patients/${patientId}/notes`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  deleteNote: (patientId: number, noteId: number) =>
    request<void>(`/patients/${patientId}/notes/${noteId}`, { method: "DELETE" }),

  getSummary: (patientId: number) =>
    request<PatientSummary>(`/patients/${patientId}/summary`),
};
