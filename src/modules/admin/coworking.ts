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

export const maintenanceIncidentFormSchema = z.object({
  spaceId: z.string().uuid("Elegí un espacio"),
  descripcion: z.string().trim().min(3, "Describí la incidencia"),
});

export type MaintenanceIncidentFormValues = z.infer<typeof maintenanceIncidentFormSchema>;

export interface MaintenanceIncidentRow {
  id: string;
  space_id: string;
  descripcion: string;
  resuelta: boolean;
  created_at: string;
  resuelta_at: string | null;
}

export const couponFormSchema = z
  .object({
    id: z.string().uuid().optional(),
    codigo: z
      .string()
      .trim()
      .min(3, "Mínimo 3 caracteres")
      .transform((v) => v.toUpperCase()),
    descuentoPct: z.coerce.number().int().min(1).max(100),
    validoDesde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    validoHasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    usosMaximos: z.coerce.number().int().min(1).optional(),
    activo: z.coerce.boolean().default(true),
  })
  .refine((data) => data.validoDesde <= data.validoHasta, {
    message: "La fecha de fin no puede ser anterior a la de inicio",
    path: ["validoHasta"],
  });

export type CouponFormValues = z.infer<typeof couponFormSchema>;

export interface CouponRow {
  id: string;
  codigo: string;
  descuento_pct: number;
  valido_desde: string;
  valido_hasta: string;
  usos_maximos: number | null;
  usos_actuales: number;
  activo: boolean;
}
