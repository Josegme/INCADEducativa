import { z } from "zod";

export const COURSE_LEVELS = ["basico", "intermedio", "avanzado"] as const;
export type CourseLevelValue = (typeof COURSE_LEVELS)[number];

export const COURSE_LEVEL_LABEL: Record<CourseLevelValue, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export const COURSE_STATUSES = ["borrador", "revision", "publicado", "archivado"] as const;
export type CourseStatusValue = (typeof COURSE_STATUSES)[number];

export const courseFormSchema = z
  .object({
    id: z.string().uuid().optional(),
    titulo: z.string().trim().min(2, "El título es obligatorio"),
    slug: z
      .string()
      .trim()
      .min(2, "El slug es obligatorio")
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "El slug solo puede tener minúsculas, números y guiones"),
    descripcion: z.string().trim().optional(),
    carreraId: z.string().trim().optional(),
    docenteId: z.string().trim().optional(),
    nivel: z.enum(COURSE_LEVELS),
    duracionHs: z.coerce.number().int().min(0).optional(),
    esGratuito: z.coerce.boolean().default(true),
    precio: z.coerce.number().min(0).default(0),
  })
  .refine((data) => data.esGratuito || data.precio > 0, {
    message: "Ingresá un precio mayor a 0 para un curso pago",
    path: ["precio"],
  });

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export interface CourseRow {
  id: string;
  titulo: string;
  slug: string;
  descripcion: string | null;
  carrera_id: string | null;
  docente_id: string | null;
  estado: CourseStatusValue;
  precio: number;
  duracion_hs: number | null;
  nivel: CourseLevelValue;
  es_gratuito: boolean;
}
