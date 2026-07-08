import { z } from "zod";

export const csvRowSchema = z.object({
  nombre: z.string().trim().min(1, "Falta el nombre"),
  apellido: z.string().trim().min(1, "Falta el apellido"),
  dni: z.string().trim().min(1, "Falta el DNI"),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  carrera: z.string().trim().min(1, "Falta la carrera"),
});

export type CsvRow = z.infer<typeof csvRowSchema>;

export type ImportRowStatus = "nuevo" | "duplicado" | "error";

export interface ImportPreviewRow {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  carrera: string;
  status: ImportRowStatus;
  motivo?: string;
  carreraId?: string;
}
