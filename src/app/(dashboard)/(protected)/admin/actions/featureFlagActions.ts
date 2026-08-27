"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import type { FeatureFlag } from "@/lib/flags";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    throw new Error("Solo el administrador puede gestionar feature flags");
  }

  return { supabase, adminId: user.id };
}

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
