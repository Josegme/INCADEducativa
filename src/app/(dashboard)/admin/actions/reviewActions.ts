"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

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
    throw new Error("Solo el administrador puede revisar cursos");
  }

  return { supabase, user };
}

export interface ReviewActionState {
  error?: string;
  success?: boolean;
}

export async function approveCourseAction(courseId: string): Promise<ReviewActionState> {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("courses")
    .update({
      estado: "publicado",
      revision_comentario: null,
      revisado_por: user.id,
      revisado_at: new Date().toISOString(),
    })
    .eq("id", courseId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/cursos");
  return { success: true };
}

export async function rejectCourseAction(courseId: string, comentario: string): Promise<ReviewActionState> {
  if (!comentario.trim()) {
    return { error: "El motivo del rechazo es obligatorio" };
  }

  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("courses")
    .update({
      estado: "borrador",
      revision_comentario: comentario.trim(),
      revisado_por: user.id,
      revisado_at: new Date().toISOString(),
    })
    .eq("id", courseId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/cursos");
  return { success: true };
}
