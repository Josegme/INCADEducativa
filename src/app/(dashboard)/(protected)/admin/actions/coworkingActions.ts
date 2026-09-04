"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { locationFormSchema, spaceFormSchema } from "@/modules/admin/coworking";

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
    throw new Error("Solo el administrador puede gestionar el Coworking");
  }

  return { supabase, adminId: user.id };
}

export interface CoworkingFormState {
  error?: string;
  success?: boolean;
}

function parseLocationFormData(formData: FormData) {
  return locationFormSchema.safeParse({
    id: formData.get("id") || undefined,
    nombre: formData.get("nombre"),
    direccion: formData.get("direccion"),
    activa: formData.get("activa") === "true",
  });
}

export async function createLocationAction(formData: FormData): Promise<CoworkingFormState> {
  const { supabase, adminId } = await requireAdmin();

  const parsed = parseLocationFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { data: created, error } = await supabase.from("locations").insert(parsed.data).select("id").single();

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "coworking.sede.crear",
    entidad: "locations",
    entidadId: created?.id ?? null,
    detalle: { nombre: parsed.data.nombre },
  });

  revalidatePath("/admin/coworking/sedes");
  return { success: true };
}

export async function updateLocationAction(formData: FormData): Promise<CoworkingFormState> {
  const { supabase, adminId } = await requireAdmin();

  const parsed = parseLocationFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, ...rest } = parsed.data;
  if (!id) {
    return { error: "Falta el id de la sede a editar" };
  }

  const { error } = await supabase.from("locations").update(rest).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "coworking.sede.editar",
    entidad: "locations",
    entidadId: id,
    detalle: { nombre: rest.nombre },
  });

  revalidatePath("/admin/coworking/sedes");
  return { success: true };
}

export async function toggleLocationActiveAction(locationId: string, activa: boolean): Promise<CoworkingFormState> {
  const { supabase, adminId } = await requireAdmin();

  const { error } = await supabase.from("locations").update({ activa }).eq("id", locationId);

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: activa ? "coworking.sede.activar" : "coworking.sede.desactivar",
    entidad: "locations",
    entidadId: locationId,
  });

  revalidatePath("/admin/coworking/sedes");
  return { success: true };
}

function parseSpaceFormData(formData: FormData) {
  return spaceFormSchema.safeParse({
    id: formData.get("id") || undefined,
    locationId: formData.get("locationId"),
    nombre: formData.get("nombre"),
    tipo: formData.get("tipo"),
    capacidad: formData.get("capacidad"),
    precioHora: formData.get("precioHora"),
    descripcion: formData.get("descripcion") ?? "",
    imagenUrl: formData.get("imagenUrl") ?? "",
    activo: formData.get("activo") === "true",
  });
}

export async function createSpaceAction(formData: FormData): Promise<CoworkingFormState> {
  const { supabase, adminId } = await requireAdmin();

  const parsed = parseSpaceFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { locationId, precioHora, descripcion, imagenUrl, ...rest } = parsed.data;

  const { data: created, error } = await supabase
    .from("spaces")
    .insert({
      ...rest,
      location_id: locationId,
      precio_hora: precioHora,
      descripcion: descripcion || null,
      imagen_url: imagenUrl || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "coworking.espacio.crear",
    entidad: "spaces",
    entidadId: created?.id ?? null,
    detalle: { nombre: rest.nombre, locationId },
  });

  revalidatePath("/admin/coworking/espacios");
  return { success: true };
}

export async function updateSpaceAction(formData: FormData): Promise<CoworkingFormState> {
  const { supabase, adminId } = await requireAdmin();

  const parsed = parseSpaceFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, locationId, precioHora, descripcion, imagenUrl, ...rest } = parsed.data;
  if (!id) {
    return { error: "Falta el id del espacio a editar" };
  }

  const { error } = await supabase
    .from("spaces")
    .update({
      ...rest,
      location_id: locationId,
      precio_hora: precioHora,
      descripcion: descripcion || null,
      imagen_url: imagenUrl || null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "coworking.espacio.editar",
    entidad: "spaces",
    entidadId: id,
    detalle: { nombre: rest.nombre, locationId },
  });

  revalidatePath("/admin/coworking/espacios");
  return { success: true };
}

export async function toggleSpaceActiveAction(spaceId: string, activo: boolean): Promise<CoworkingFormState> {
  const { supabase, adminId } = await requireAdmin();

  const { error } = await supabase.from("spaces").update({ activo }).eq("id", spaceId);

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: activo ? "coworking.espacio.activar" : "coworking.espacio.desactivar",
    entidad: "spaces",
    entidadId: spaceId,
  });

  revalidatePath("/admin/coworking/espacios");
  return { success: true };
}
