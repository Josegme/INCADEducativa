"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { logAudit } from "@/lib/audit";
import { maintenanceIncidentFormSchema } from "@/modules/admin/coworking";

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
