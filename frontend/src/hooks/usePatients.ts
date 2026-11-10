// All server-state access goes through TanStack Query hooks; components never call fetch.
// Query keys are structured so mutations can invalidate precisely.

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "../lib/api";
import type { PatientInput, PatientListParams } from "../lib/types";

export const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  list: (params: PatientListParams) => [...patientKeys.lists(), params] as const,
  detail: (id: number) => [...patientKeys.all, "detail", id] as const,
  notes: (id: number) => [...patientKeys.all, "notes", id] as const,
  summary: (id: number) => [...patientKeys.all, "summary", id] as const,
};

export function usePatientList(params: PatientListParams) {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: () => api.listPatients(params),
    // keeps the previous page rendered while the next loads: non-blocking search/pagination
    placeholderData: keepPreviousData,
  });
}

export function usePatient(id: number) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => api.getPatient(id),
    enabled: Number.isFinite(id),
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PatientInput) => api.createPatient(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: patientKeys.lists() }),
  });
}

export function useUpdatePatient(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PatientInput) => api.updatePatient(id, data),
    onSuccess: (patient) => {
      qc.setQueryData(patientKeys.detail(id), patient);
      qc.invalidateQueries({ queryKey: patientKeys.lists() });
      qc.invalidateQueries({ queryKey: patientKeys.summary(id) });
    },
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deletePatient(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: patientKeys.all }),
  });
}

export function usePatientNotes(patientId: number) {
  return useQuery({
    queryKey: patientKeys.notes(patientId),
    queryFn: () => api.listNotes(patientId),
    enabled: Number.isFinite(patientId),
  });
}

export function useCreateNote(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => api.createNote(patientId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.notes(patientId) });
      qc.invalidateQueries({ queryKey: patientKeys.summary(patientId) });
    },
  });
}

export function useDeleteNote(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: number) => api.deleteNote(patientId, noteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.notes(patientId) });
      qc.invalidateQueries({ queryKey: patientKeys.summary(patientId) });
    },
  });
}

export function usePatientSummary(patientId: number) {
  return useQuery({
    queryKey: patientKeys.summary(patientId),
    queryFn: () => api.getSummary(patientId),
    enabled: Number.isFinite(patientId),
  });
}
