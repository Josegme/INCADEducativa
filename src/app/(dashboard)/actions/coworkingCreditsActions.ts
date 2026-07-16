"use server";

import { revalidatePath } from "next/cache";

import { awardPoints } from "@/lib/points";
import { createClient } from "@/lib/supabase/server";
import { POINTS_PER_COWORKING_CREDIT } from "@/modules/coworking/credits";

export interface CoworkingCreditsActionState {
  error?: string;
  success?: boolean;
}

/**
 * Canjea puntos de la plataforma educativa por créditos de Coworking
 * (1 crédito = 1 hora). `awardPoints()` con un monto negativo es el "gasto"
 * — el ledger sigue siendo append-only, solo se agrega un movimiento nuevo,
 * nunca se edita uno existente (CLAUDE.md regla #7).
 */
export async function redeemPointsForCreditAction(cantidadCreditos: number): Promise<CoworkingCreditsActionState> {
  if (!Number.isInteger(cantidadCreditos) || cantidadCreditos < 1) {
    return { error: "Cantidad inválida" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { data: profile } = await supabase.from("users").select("puntos, coworking_creditos_canje").eq("id", user.id).single();

  const costo = cantidadCreditos * POINTS_PER_COWORKING_CREDIT;
  if (!profile || profile.puntos < costo) {
    return { error: "No tenés puntos suficientes" };
  }

  await awardPoints(user.id, -costo, "canje_coworking");

  const { error } = await supabase
    .from("users")
    .update({ coworking_creditos_canje: profile.coworking_creditos_canje + cantidadCreditos })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
