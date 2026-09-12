"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { logAudit } from "@/lib/audit";
import { catalogPlanFormSchema } from "@/modules/admin/catalogPlans";

export interface CatalogPlanFormState {
  error?: string;
  success?: boolean;
}

function parseCatalogPlanFormData(formData: FormData) {
  return catalogPlanFormSchema.safeParse({
    id: formData.get("id") || undefined,
    nombre: formData.get("nombre"),
    precio: formData.get("precio"),
    activo: formData.get("activo") === "true",
  });
}

export async function createCatalogPlanAction(formData: FormData): Promise<CatalogPlanFormState> {
  const { supabase, adminId } = await requireAdmin();

  const parsed = parseCatalogPlanFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { data: created, error } = await supabase.from("catalogo_planes").insert(parsed.data).select("id").single();

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "catalogo.plan.crear",
    entidad: "catalogo_planes",
    entidadId: created?.id ?? null,
    detalle: { nombre: parsed.data.nombre, precio: parsed.data.precio },
  });

  revalidatePath("/admin/suscripciones");
  return { success: true };
}

export async function updateCatalogPlanAction(formData: FormData): Promise<CatalogPlanFormState> {
  const { supabase, adminId } = await requireAdmin();

  const parsed = parseCatalogPlanFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, ...rest } = parsed.data;
  if (!id) {
    return { error: "Falta el id del plan a editar" };
  }

  const { error } = await supabase.from("catalogo_planes").update(rest).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "catalogo.plan.editar",
    entidad: "catalogo_planes",
    entidadId: id,
    detalle: { nombre: rest.nombre, precio: rest.precio },
  });

  revalidatePath("/admin/suscripciones");
  return { success: true };
}

export async function toggleCatalogPlanActiveAction(planId: string, activo: boolean): Promise<CatalogPlanFormState> {
  const { supabase, adminId } = await requireAdmin();

  const { error } = await supabase.from("catalogo_planes").update({ activo }).eq("id", planId);

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: activo ? "catalogo.plan.activar" : "catalogo.plan.desactivar",
    entidad: "catalogo_planes",
    entidadId: planId,
  });

  revalidatePath("/admin/suscripciones");
  return { success: true };
}
