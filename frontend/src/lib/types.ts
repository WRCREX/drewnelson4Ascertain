// Mirrors the backend Pydantic schemas 1:1 so the API contract lives in one place per side.

export type PatientStatus = "active" | "inactive" | "critical";

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  address: string;
  blood_type: string;
  allergies: string[];
  conditions: string[];
  status: PatientStatus;
  last_visit: string | null;
  age: number;
  created_at: string;
  updated_at: string;
}

export interface PatientPage {
  items: Patient[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface PatientInput {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  address: string;
  blood_type: string;
  allergies: string[];
  conditions: string[];
  status: PatientStatus;
  last_visit?: string | null;
}

export interface Note {
  id: number;
  patient_id: number;
  content: string;
  created_at: string;
}

export interface PatientSummary {
  patient_id: number;
  name: string;
  age: number;
  blood_type: string;
  conditions: string[];
  allergies: string[];
  narrative: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface PatientListParams {
  page: number;
  page_size: number;
  search?: string;
  status?: PatientStatus | "";
  sort_by: string;
  sort_dir: "asc" | "desc";
}
