import { z } from "zod";

export const locationFormSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().trim().min(2, "El nombre es obligatorio"),
  direccion: z.string().trim().min(2, "La dirección es obligatoria"),
  activa: z.coerce.boolean().default(true),
});

export type LocationFormValues = z.infer<typeof locationFormSchema>;

export interface LocationRow {
  id: string;
  nombre: string;
  direccion: string;
  activa: boolean;
}

export type SpaceType = "hot_desk" | "sala_reunion" | "aula";

export const SPACE_TYPES: SpaceType[] = ["hot_desk", "sala_reunion", "aula"];

export const SPACE_TYPE_LABEL: Record<SpaceType, string> = {
  hot_desk: "Hot desk",
  sala_reunion: "Sala de reunión",
  aula: "Aula",
};

export const spaceFormSchema = z.object({
  id: z.string().uuid().optional(),
  locationId: z.string().uuid("Elegí una sede"),
  nombre: z.string().trim().min(2, "El nombre es obligatorio"),
  tipo: z.enum(["hot_desk", "sala_reunion", "aula"]),
  capacidad: z.coerce.number().int().min(1, "La capacidad mínima es 1"),
  precioHora: z.coerce.number().min(0, "El precio no puede ser negativo"),
  descripcion: z.string().trim().optional(),
  imagenUrl: z.string().trim().optional(),
  activo: z.coerce.boolean().default(true),
});

export type SpaceFormValues = z.infer<typeof spaceFormSchema>;

export interface SpaceRow {
  id: string;
  location_id: string;
  nombre: string;
  tipo: SpaceType;
  capacidad: number;
  precio_hora: number;
  descripcion: string | null;
  imagen_url: string | null;
  activo: boolean;
}
