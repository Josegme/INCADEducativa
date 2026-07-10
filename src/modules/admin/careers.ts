import { z } from "zod";

export const careerFormSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().trim().min(2, "El nombre es obligatorio"),
  slug: z
    .string()
    .trim()
    .min(2, "El slug es obligatorio")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "El slug solo puede tener minúsculas, números y guiones"),
  descripcion: z.string().trim().optional(),
  imagenUrl: z.string().trim().optional(),
  activa: z.coerce.boolean().default(true),
});

export type CareerFormValues = z.infer<typeof careerFormSchema>;

export interface CareerRow {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagen_url: string | null;
  activa: boolean;
  orden: number;
}
