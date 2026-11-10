// Create/edit form: Zod owns client-side validation, RHF owns form state,
// and server-side 422s are mapped back onto the matching fields.

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { ApiError } from "../lib/api";
import type { Patient, PatientInput } from "../lib/types";
import { styles } from "../styles";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const patientSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  date_of_birth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((v) => new Date(v) <= new Date(), "Date of birth cannot be in the future"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number").max(50),
  address: z.string().min(1, "Address is required").max(500),
  blood_type: z.enum(BLOOD_TYPES, { message: "Select a blood type" }),
  allergies: z.string(),
  conditions: z.string(),
  status: z.enum(["active", "inactive", "critical"]),
});

type FormValues = z.infer<typeof patientSchema>;

function toFormValues(p?: Patient): FormValues {
  return {
    first_name: p?.first_name ?? "",
    last_name: p?.last_name ?? "",
    date_of_birth: p?.date_of_birth ?? "",
    email: p?.email ?? "",
    phone: p?.phone ?? "",
    address: p?.address ?? "",
    blood_type: (p?.blood_type as FormValues["blood_type"]) ?? "O+",
    allergies: p?.allergies.join(", ") ?? "",
    conditions: p?.conditions.join(", ") ?? "",
    status: p?.status ?? "active",
  };
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

interface Props {
  patient?: Patient;
  onSubmit: (data: PatientInput) => Promise<unknown>;
  submitLabel: string;
}

export function PatientForm({ patient, onSubmit, submitLabel }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: toFormValues(patient),
  });

  async function submit(values: FormValues) {
    const payload: PatientInput = {
      ...values,
      allergies: splitList(values.allergies),
      conditions: splitList(values.conditions),
      last_visit: patient?.last_visit ?? null,
    };
    try {
      await onSubmit(payload);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.length > 0) {
        // map server validation errors onto the matching form fields
        for (const fe of err.fieldErrors) {
          setError(fe.field as keyof FormValues, { message: fe.message });
        }
      } else {
        setError("root", {
          message: err instanceof Error ? err.message : "Something went wrong",
        });
      }
    }
  }

  const field = (
    name: keyof FormValues,
    label: string,
    input: React.ReactNode
  ) => (
    <div>
      <label className={styles.label}>{label}</label>
      {input}
      {errors[name] && <p className={styles.fieldError}>{errors[name]?.message}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
      {errors.root && <div className={styles.formError}>{errors.root.message}</div>}

      <div className={styles.cardPad}>
        <h2 className={styles.sectionTitle}>Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {field("first_name", "First name", <input className={styles.input} {...register("first_name")} />)}
          {field("last_name", "Last name", <input className={styles.input} {...register("last_name")} />)}
          {field("date_of_birth", "Date of birth", <input type="date" className={styles.input} {...register("date_of_birth")} />)}
          {field("email", "Email", <input type="email" className={styles.input} {...register("email")} />)}
          {field("phone", "Phone", <input className={styles.input} {...register("phone")} />)}
          {field("address", "Address", <input className={styles.input} {...register("address")} />)}
        </div>
      </div>

      <div className={styles.cardPad}>
        <h2 className={styles.sectionTitle}>Medical Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {field(
            "blood_type",
            "Blood type",
            <select className={styles.select} {...register("blood_type")}>
              {BLOOD_TYPES.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          )}
          {field(
            "status",
            "Status",
            <select className={styles.select} {...register("status")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="critical">Critical</option>
            </select>
          )}
          {field(
            "allergies",
            "Allergies (comma-separated)",
            <input className={styles.input} placeholder="Penicillin, Latex" {...register("allergies")} />
          )}
          {field(
            "conditions",
            "Conditions (comma-separated)",
            <input className={styles.input} placeholder="Hypertension, Asthma" {...register("conditions")} />
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
