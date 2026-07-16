import { z } from "zod";

import type { BookingStatus, DiscountType } from "@/modules/coworking/booking";

export interface BookingAdminRow {
  id: string;
  space_id: string;
  user_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: BookingStatus;
  monto: number;
  descuento_pct: number;
  tipo_descuento: DiscountType;
  notas: string | null;
  espacioNombre: string;
  sedeNombre: string;
  usuarioNombre: string;
  usuarioEmail: string;
}

export interface BookingFilters {
  estado?: BookingStatus;
  fecha?: string;
  spaceId?: string;
  tipoDescuento?: DiscountType;
}

export interface UserOption {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

export const manualBookingFormSchema = z.object({
  userId: z.string().uuid("Elegí un usuario"),
  spaceId: z.string().uuid("Elegí un espacio"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  horaInicio: z.coerce.number().int().min(0).max(23),
  duracionHoras: z.coerce.number().int().min(1).max(12),
  notas: z.string().trim().optional(),
});
export type ManualBookingFormValues = z.infer<typeof manualBookingFormSchema>;

export interface RevenueRow {
  periodo: string;
  location_id: string;
  sede: string;
  tipo_descuento: DiscountType;
  reservas_pagadas: number;
  ingresos: number;
}

export const DISCOUNT_TYPE_LABEL: Record<DiscountType, string> = {
  institucional: "Institucional",
  publico: "Público",
  manual: "Manual",
  canje: "Canje de puntos",
};

/** No hay librería de export CSV en el repo — string simple con comillas escapadas. */
export function buildCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (value: string | number) => {
    const str = String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [headers.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))];
  return lines.join("\n");
}
