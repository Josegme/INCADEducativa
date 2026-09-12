"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { logAudit } from "@/lib/audit";
import type { FeatureFlag } from "@/lib/flags";

export interface SetFeatureFlagState {
  error?: string;
  success?: boolean;
}

export async function setFeatureFlagAction(flag: FeatureFlag, activo: boolean): Promise<SetFeatureFlagState> {
  const { supabase, adminId } = await requireAdmin();

  const { error } = await supabase
    .from("feature_flags")
    .upsert({ flag, activo, updated_by: adminId }, { onConflict: "flag" });

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: activo ? "feature_flag.activar" : "feature_flag.desactivar",
    entidad: "feature_flags",
    detalle: { flag },
  });

  revalidatePath("/admin/configuracion");
  revalidatePath("/", "layout");
  return { success: true };
}
