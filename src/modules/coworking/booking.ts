import { z } from "zod";

export const BOOKING_OPEN_HOUR = 8;
export const BOOKING_CLOSE_HOUR = 22;
export const BOOKING_DAYS_AHEAD = 14;
export const MIN_DURATION_HOURS = 1;
export const MAX_DURATION_HOURS = 4;

export type BookingStatus =
  | "pendiente"
  | "confirmada"
  | "en_uso"
  | "completada"
  | "cancelada"
  | "no_show";

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pendiente: "Pendiente de pago",
  confirmada: "Confirmada",
  en_uso: "En uso",
  completada: "Completada",
  cancelada: "Cancelada",
  no_show: "No se presentó",
};

export type DiscountType = "institucional" | "publico" | "manual";

export interface BookingRow {
  id: string;
  space_id: string;
  user_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: BookingStatus;
  monto: number;
  descuento_pct: number;
  tipo_descuento: DiscountType;
}

export const registerFieldsSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá tu nombre"),
  email: z.string().trim().email("Ingresá un email válido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export const bookingFormSchema = z.object({
  spaceId: z.string().uuid(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  horaInicio: z.coerce.number().int().min(BOOKING_OPEN_HOUR).max(BOOKING_CLOSE_HOUR - 1),
  duracionHoras: z.coerce.number().int().min(MIN_DURATION_HOURS).max(MAX_DURATION_HOURS),
  telefonoContacto: z
    .string()
    .trim()
    .min(6, "Ingresá un número válido")
    .optional()
    .or(z.literal("")),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
export type RegisterFieldsValues = z.infer<typeof registerFieldsSchema>;

export interface BookingAmount {
  montoOriginal: number;
  montoFinal: number;
  descuentoPct: number;
  tipoDescuento: DiscountType;
}

export function computeBookingAmount(precioHora: number, duracionHoras: number, descuentoPct: number): BookingAmount {
  const montoOriginal = Math.round(precioHora * duracionHoras * 100) / 100;
  const montoFinal =
    descuentoPct > 0 ? Math.round(montoOriginal * (1 - descuentoPct / 100) * 100) / 100 : montoOriginal;

  return {
    montoOriginal,
    montoFinal,
    descuentoPct,
    tipoDescuento: descuentoPct > 0 ? "institucional" : "publico",
  };
}

export function nextBookingDays(count: number = BOOKING_DAYS_AHEAD): { iso: string; label: string }[] {
  const days: { iso: string; label: string }[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "2-digit" });
    days.push({ iso, label });
  }

  return days;
}

export function hourSlots(open: number = BOOKING_OPEN_HOUR, close: number = BOOKING_CLOSE_HOUR): number[] {
  const slots: number[] = [];
  for (let h = open; h < close; h++) slots.push(h);
  return slots;
}
