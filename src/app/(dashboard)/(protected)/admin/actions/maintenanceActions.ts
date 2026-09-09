"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { maintenanceIncidentFormSchema } from "@/modules/admin/coworking";

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
    throw new Error("Solo el administrador puede gestionar incidencias de mantenimiento");
  }

  return { supabase, adminId: user.id };
}

export interface MaintenanceActionState {
  error?: string;
  success?: boolean;
}

export async function createMaintenanceIncidentAction(formData: FormData): Promise<MaintenanceActionState> {
  const { supabase, adminId } = await requireAdmin();

  const parsed = maintenanceIncidentFormSchema.safeParse({
    spaceId: formData.get("spaceId"),
    descripcion: formData.get("descripcion"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { data: created, error } = await supabase
    .from("maintenance_incidents")
    .insert({
      space_id: parsed.data.spaceId,
      descripcion: parsed.data.descripcion,
      reportada_por: adminId,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "coworking.mantenimiento.reportar",
    entidad: "maintenance_incidents",
    entidadId: created?.id ?? null,
    detalle: { spaceId: parsed.data.spaceId },
  });

  revalidatePath("/admin/coworking/mantenimiento");
  return { success: true };
}

export async function resolveMaintenanceIncidentAction(incidentId: string): Promise<MaintenanceActionState> {
  const { supabase, adminId } = await requireAdmin();

  const { error } = await supabase
    .from("maintenance_incidents")
    .update({ resuelta: true, resuelta_at: new Date().toISOString() })
    .eq("id", incidentId);

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "coworking.mantenimiento.resolver",
    entidad: "maintenance_incidents",
    entidadId: incidentId,
  });

  revalidatePath("/admin/coworking/mantenimiento");
  return { success: true };
}
