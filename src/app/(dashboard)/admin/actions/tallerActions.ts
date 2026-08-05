"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { tallerFormSchema, type TallerEstado } from "@/modules/talleres/talleres";

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
    throw new Error("Solo el administrador puede gestionar talleres");
  }

  return { supabase, adminId: user.id };
}

export interface TallerFormState {
  error?: string;
  success?: boolean;
}

function parseTallerFormData(formData: FormData) {
  return tallerFormSchema.safeParse({
    id: formData.get("id") || undefined,
    titulo: formData.get("titulo"),
    descripcion: formData.get("descripcion") ?? "",
    fecha: formData.get("fecha"),
    hora: formData.get("hora"),
    duracionMinutos: formData.get("duracionMinutos"),
    linkVirtual: formData.get("linkVirtual") ?? "",
    grabacionUrl: formData.get("grabacionUrl") ?? "",
    capacidad: formData.get("capacidad") || "",
  });
}

export async function createTallerAction(formData: FormData): Promise<TallerFormState> {
  const { supabase, adminId } = await requireAdmin();

  const parsed = parseTallerFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { titulo, descripcion, fecha, hora, duracionMinutos, linkVirtual, grabacionUrl, capacidad } = parsed.data;
  const fechaInicio = new Date(`${fecha}T${String(hora).padStart(2, "0")}:00:00`);

  const { data: created, error } = await supabase
    .from("talleres")
    .insert({
      titulo,
      descripcion: descripcion || null,
      fecha_inicio: fechaInicio.toISOString(),
      duracion_minutos: duracionMinutos,
      link_virtual: linkVirtual || null,
      grabacion_url: grabacionUrl || null,
      capacidad: capacidad || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "taller.crear",
    entidad: "talleres",
    entidadId: created?.id ?? null,
    detalle: { titulo },
  });

  revalidatePath("/admin/talleres");
  return { success: true };
}

export async function updateTallerAction(formData: FormData): Promise<TallerFormState> {
  const { supabase, adminId } = await requireAdmin();

  const parsed = parseTallerFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, titulo, descripcion, fecha, hora, duracionMinutos, linkVirtual, grabacionUrl, capacidad } = parsed.data;
  if (!id) {
    return { error: "Falta el id del taller a editar" };
  }
  const fechaInicio = new Date(`${fecha}T${String(hora).padStart(2, "0")}:00:00`);

  const { error } = await supabase
    .from("talleres")
    .update({
      titulo,
      descripcion: descripcion || null,
      fecha_inicio: fechaInicio.toISOString(),
      duracion_minutos: duracionMinutos,
      link_virtual: linkVirtual || null,
      grabacion_url: grabacionUrl || null,
      capacidad: capacidad || null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "taller.editar",
    entidad: "talleres",
    entidadId: id,
    detalle: { titulo },
  });

  revalidatePath("/admin/talleres");
  revalidatePath("/talleres");
  return { success: true };
}

export async function setTallerEstadoAction(tallerId: string, estado: TallerEstado): Promise<TallerFormState> {
  const { supabase, adminId } = await requireAdmin();

  const { error } = await supabase.from("talleres").update({ estado }).eq("id", tallerId);

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "taller.cambiar_estado",
    entidad: "talleres",
    entidadId: tallerId,
    detalle: { estado },
  });

  revalidatePath("/admin/talleres");
  revalidatePath("/talleres");
  return { success: true };
}
