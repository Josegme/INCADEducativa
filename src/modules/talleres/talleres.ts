import { z } from "zod";

export type TallerEstado = "borrador" | "publicado" | "cancelado";

export const TALLER_ESTADO_LABEL: Record<TallerEstado, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
  cancelado: "Cancelado",
};

export interface TallerRow {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  duracion_minutos: number;
  link_virtual: string | null;
  grabacion_url: string | null;
  capacidad: number | null;
  estado: TallerEstado;
}

export const tallerFormSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: z.string().trim().min(2, "El título es obligatorio"),
  descripcion: z.string().trim().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  hora: z.coerce.number().int().min(0).max(23),
  duracionMinutos: z.coerce.number().int().min(15, "Mínimo 15 minutos"),
  linkVirtual: z.string().trim().optional(),
  grabacionUrl: z.string().trim().optional(),
  capacidad: z.coerce.number().int().min(1).optional().or(z.literal("")),
});

export type TallerFormValues = z.infer<typeof tallerFormSchema>;
