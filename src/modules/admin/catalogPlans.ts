import { z } from "zod";

export const catalogPlanFormSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().trim().min(2, "El nombre es obligatorio"),
  precio: z.coerce.number().min(0, "El precio no puede ser negativo"),
  activo: z.coerce.boolean().default(true),
});
export type CatalogPlanFormValues = z.infer<typeof catalogPlanFormSchema>;

export interface CatalogPlanRow {
  id: string;
  nombre: string;
  precio: number;
  activo: boolean;
}
