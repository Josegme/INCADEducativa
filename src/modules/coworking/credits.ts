/**
 * Canje de puntos de la plataforma educativa por créditos de Coworking
 * (Sprint 19-20). Independiente de `memberships.creditos_restantes`
 * (Sprint 17-18) — un usuario puede tener ambos saldos, se consumen por
 * separado. 1 crédito = 1 hora de reserva.
 */
export const POINTS_PER_COWORKING_CREDIT = 50;

export function creditsAffordable(puntos: number): number {
  return Math.floor(puntos / POINTS_PER_COWORKING_CREDIT);
}
