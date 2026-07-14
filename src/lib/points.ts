import { createAdminClient } from "@/lib/supabase/admin";

/**
 * `award_points()` es SECURITY DEFINER con EXECUTE revocado a `authenticated`
 * (migración 005, SEG-01) — solo se puede invocar con el cliente service_role.
 */
export async function awardPoints(userId: string, amount: number, motivo: string, referenceId?: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("award_points", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: motivo,
    p_ref: referenceId ?? null,
  });

  if (error) {
    console.error("[points] award_points falló:", error);
  }
}
