import { z } from "zod";

export type CompraCursoEstado = "pendiente" | "aprobado" | "rechazado" | "reembolsado";

export const COMPRA_ESTADO_LABEL: Record<CompraCursoEstado, string> = {
  pendiente: "Pendiente de pago",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  reembolsado: "Reembolsado",
};

export type DiscountType = "institucional" | "publico" | "manual" | "canje" | "cupon";

export const purchaseFormSchema = z.object({
  courseId: z.string().uuid(),
  cuponCodigo: z.string().trim().optional().or(z.literal("")),
});

export type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

export interface CoursePurchaseAmount {
  montoOriginal: number;
  montoFinal: number;
  descuentoPct: number;
  tipoDescuento: DiscountType;
}

export function computeCoursePurchaseAmount(precio: number, descuentoPct: number): CoursePurchaseAmount {
  const montoOriginal = Math.round(precio * 100) / 100;
  const montoFinal =
    descuentoPct > 0 ? Math.round(montoOriginal * (1 - descuentoPct / 100) * 100) / 100 : montoOriginal;

  return {
    montoOriginal,
    montoFinal,
    descuentoPct,
    tipoDescuento: descuentoPct > 0 ? "institucional" : "publico",
  };
}
