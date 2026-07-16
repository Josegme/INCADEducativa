export type MembershipStatus = "activa" | "pendiente" | "inactiva";

export interface MembershipRow {
  id: string;
  plan_id: string | null;
  activa: boolean;
  inicio: string | null;
  fin: string | null;
  creditos_restantes: number;
  mp_preapproval_id: string | null;
}

export interface MembershipPlanPublic {
  id: string;
  tipo: "mensual" | "anual";
  nombre: string;
  precio: number;
  creditos_incluidos: number;
}
