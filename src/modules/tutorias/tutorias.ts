import { z } from "zod";

export type TutoriaModalidad = "virtual" | "presencial";
export type TutoriaEstado = "programada" | "realizada" | "cancelada";

export const TUTORIA_ESTADO_LABEL: Record<TutoriaEstado, string> = {
  programada: "Programada",
  realizada: "Realizada",
  cancelada: "Cancelada",
};

export interface TutoriaRow {
  id: string;
  curso_id: string;
  docente_id: string;
  modalidad: TutoriaModalidad;
  fecha_inicio: string;
  fecha_fin: string;
  link_virtual: string | null;
  space_id: string | null;
  booking_id: string | null;
  grabacion_url: string | null;
  estado: TutoriaEstado;
}

export interface TutoriaAsistenciaRow {
  id: string;
  tutoria_id: string;
  alumno_id: string;
  presente: boolean;
}

export const tutoriaFormSchema = z.object({
  cursoId: z.string().uuid(),
  modalidad: z.enum(["virtual", "presencial"]),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  horaInicio: z.coerce.number().int().min(0).max(23),
  duracionHoras: z.coerce.number().int().min(1).max(4),
  linkVirtual: z.string().trim().optional().or(z.literal("")),
  spaceId: z.string().uuid().optional().or(z.literal("")),
});

export type TutoriaFormValues = z.infer<typeof tutoriaFormSchema>;

/**
 * Ventanas de recordatorio (24hs y 1h antes de `fecha_inicio`), con un margen
 * de ±1h para que el cron de 5-10 min no se salte una tutoría entre corridas.
 * Función pura, reusable en el cron y en tests.
 */
export function reminderWindow(hoursBefore: number, now: Date = new Date()) {
  const from = new Date(now.getTime() + (hoursBefore - 1) * 60 * 60 * 1000);
  const to = new Date(now.getTime() + (hoursBefore + 1) * 60 * 60 * 1000);
  return { from, to };
}
