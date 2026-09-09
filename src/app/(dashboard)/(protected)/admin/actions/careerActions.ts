"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { careerFormSchema } from "@/modules/admin/careers";

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
    throw new Error("Solo el administrador puede gestionar carreras");
  }

  return { supabase, adminId: user.id };
}

export interface CareerFormState {
  error?: string;
  success?: boolean;
}

function parseCareerFormData(formData: FormData) {
  return careerFormSchema.safeParse({
    id: formData.get("id") || undefined,
    nombre: formData.get("nombre"),
    slug: formData.get("slug"),
    descripcion: formData.get("descripcion") ?? "",
    imagenUrl: formData.get("imagenUrl") ?? "",
    activa: formData.get("activa") === "true",
  });
}

export async function createCareerAction(formData: FormData): Promise<CareerFormState> {
  const { supabase, adminId } = await requireAdmin();

  const parsed = parseCareerFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { nombre, slug, descripcion, imagenUrl, activa } = parsed.data;

  const { data: created, error } = await supabase
    .from("careers")
    .insert({
      nombre,
      slug,
      descripcion: descripcion || null,
      imagen_url: imagenUrl || null,
      activa,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.code === "23505" ? "Ya existe una carrera con ese slug" : error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "carrera.crear",
    entidad: "careers",
    entidadId: created?.id ?? null,
    detalle: { nombre, slug },
  });

  revalidatePath("/admin/carreras");
  return { success: true };
}

export async function updateCareerAction(formData: FormData): Promise<CareerFormState> {
  const { supabase, adminId } = await requireAdmin();

  const parsed = parseCareerFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, nombre, slug, descripcion, imagenUrl, activa } = parsed.data;
  if (!id) {
    return { error: "Falta el id de la carrera a editar" };
  }

  const { error } = await supabase
    .from("careers")
    .update({
      nombre,
      slug,
      descripcion: descripcion || null,
      imagen_url: imagenUrl || null,
      activa,
    })
    .eq("id", id);

  if (error) {
    return { error: error.code === "23505" ? "Ya existe una carrera con ese slug" : error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "carrera.editar",
    entidad: "careers",
    entidadId: id,
    detalle: { nombre, slug, activa },
  });

  revalidatePath("/admin/carreras");
  return { success: true };
}
