"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { courseFormSchema, type CourseStatusValue } from "@/modules/admin/courses";

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
    throw new Error("Solo el administrador puede gestionar cursos");
  }

  return { supabase };
}

export interface CourseFormState {
  error?: string;
  success?: boolean;
}

function parseCourseFormData(formData: FormData) {
  return courseFormSchema.safeParse({
    id: formData.get("id") || undefined,
    titulo: formData.get("titulo"),
    slug: formData.get("slug"),
    descripcion: formData.get("descripcion") ?? "",
    carreraId: formData.get("carreraId") ?? "",
    docenteId: formData.get("docenteId") ?? "",
    nivel: formData.get("nivel"),
    duracionHs: formData.get("duracionHs") || undefined,
    esGratuito: formData.get("esGratuito") === "true",
    precio: formData.get("precio") || 0,
  });
}

export async function createCourseAction(formData: FormData): Promise<CourseFormState> {
  const { supabase } = await requireAdmin();

  const parsed = parseCourseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { titulo, slug, descripcion, carreraId, docenteId, nivel, duracionHs, esGratuito, precio } = parsed.data;

  const { error } = await supabase.from("courses").insert({
    titulo,
    slug,
    descripcion: descripcion || null,
    carrera_id: carreraId || null,
    docente_id: docenteId || null,
    nivel,
    duracion_hs: duracionHs ?? null,
    es_gratuito: esGratuito,
    precio: esGratuito ? 0 : precio,
  });

  if (error) {
    return { error: error.code === "23505" ? "Ya existe un curso con ese slug" : error.message };
  }

  revalidatePath("/admin/cursos");
  return { success: true };
}

export async function updateCourseAction(formData: FormData): Promise<CourseFormState> {
  const { supabase } = await requireAdmin();

  const parsed = parseCourseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, titulo, slug, descripcion, carreraId, docenteId, nivel, duracionHs, esGratuito, precio } = parsed.data;
  if (!id) {
    return { error: "Falta el id del curso a editar" };
  }

  const { error } = await supabase
    .from("courses")
    .update({
      titulo,
      slug,
      descripcion: descripcion || null,
      carrera_id: carreraId || null,
      docente_id: docenteId || null,
      nivel,
      duracion_hs: duracionHs ?? null,
      es_gratuito: esGratuito,
      precio: esGratuito ? 0 : precio,
    })
    .eq("id", id);

  if (error) {
    return { error: error.code === "23505" ? "Ya existe un curso con ese slug" : error.message };
  }

  revalidatePath("/admin/cursos");
  return { success: true };
}

export interface SetCourseEstadoState {
  error?: string;
  success?: boolean;
}

export async function setCourseEstadoAction(
  courseId: string,
  estado: CourseStatusValue
): Promise<SetCourseEstadoState> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("courses").update({ estado }).eq("id", courseId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/cursos");
  return { success: true };
}
