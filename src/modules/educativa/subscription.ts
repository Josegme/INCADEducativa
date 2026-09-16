export type SubscriptionStatus = "activa" | "pendiente" | "inactiva";

export interface CatalogSubscriptionRow {
  id: string;
  plan_id: string | null;
  activa: boolean;
  inicio: string | null;
  fin: string | null;
  mp_preapproval_id: string | null;
}

export interface CatalogPlanPublic {
  id: string;
  nombre: string;
  precio: number;
}

export interface CatalogPlanRow extends CatalogPlanPublic {
  activo: boolean;
}
