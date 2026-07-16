import { z } from "zod";

export type MembershipPlanType = "mensual" | "anual";
export const MEMBERSHIP_PLAN_TYPES: MembershipPlanType[] = ["mensual", "anual"];
export const MEMBERSHIP_PLAN_TYPE_LABEL: Record<MembershipPlanType, string> = {
  mensual: "Mensual",
  anual: "Anual",
};

export const membershipPlanFormSchema = z.object({
  id: z.string().uuid().optional(),
  tipo: z.enum(["mensual", "anual"]),
  nombre: z.string().trim().min(2, "El nombre es obligatorio"),
  precio: z.coerce.number().min(0, "El precio no puede ser negativo"),
  creditosIncluidos: z.coerce.number().int().min(1, "Los créditos mínimos son 1"),
  activo: z.coerce.boolean().default(true),
});
export type MembershipPlanFormValues = z.infer<typeof membershipPlanFormSchema>;

export interface MembershipPlanRow {
  id: string;
  tipo: MembershipPlanType;
  nombre: string;
  precio: number;
  creditos_incluidos: number;
  activo: boolean;
}
