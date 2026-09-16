export type TutoriaAddonEstado = "pendiente" | "aprobado" | "rechazado" | "reembolsado";

export const TUTORIA_ADDON_ESTADO_LABEL: Record<TutoriaAddonEstado, string> = {
  pendiente: "Pendiente de pago",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  reembolsado: "Reembolsado",
};

/**
 * Traduce el status de un pago de MercadoPago al estado interno de
 * `tutoria_addon_compras` (T13). Única fuente de verdad del acceso: solo
 * `payment.approved` da acceso a las tutorías del curso — cualquier otro
 * status (`rejected`, `pending`, `in_process`, etc.) deja al usuario sin
 * acceso, mismo criterio que el resto de los webhooks de MP del sistema
 * (CLAUDE.md regla #9).
 */
export function resolveTutoriaAddonEstado(mpStatus: string): TutoriaAddonEstado {
  if (mpStatus === "approved") return "aprobado";
  if (mpStatus === "rejected") return "rechazado";
  return "pendiente";
}

/** `estado === 'aprobado'` es la única condición que otorga acceso (grace logic del webhook). */
export function grantsTutoriaAddonAccess(estado: TutoriaAddonEstado): boolean {
  return estado === "aprobado";
}
