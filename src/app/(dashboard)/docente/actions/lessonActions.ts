"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { LessonType } from "@/modules/educativa/lessons";

export interface LessonActionState {
  error?: string;
  success?: boolean;
}

export interface LessonInput {
  titulo: string;
  tipo: LessonType;
  contenidoUrl?: string;
  contenidoText?: string;
  duracionMin?: number;
}

function lessonPayload(data: LessonInput) {
  return {
    titulo: data.titulo,
    tipo: data.tipo,
    contenido_url: data.tipo === "texto" ? null : data.contenidoUrl || null,
    contenido_text: data.tipo === "texto" ? data.contenidoText || null : null,
    duracion_min: data.duracionMin ?? null,
  };
}

export async function createLessonAction(
  moduleId: string,
  courseId: string,
  orden: number,
  data: LessonInput
): Promise<LessonActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase
    .from("lessons")
    .insert({ module_id: moduleId, orden, publicada: true, ...lessonPayload(data) });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/docente/cursos/${courseId}`);
  return { success: true };
}

export async function updateLessonAction(lessonId: string, courseId: string, data: LessonInput): Promise<LessonActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase.from("lessons").update(lessonPayload(data)).eq("id", lessonId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/docente/cursos/${courseId}`);
  return { success: true };
}

export async function deleteLessonAction(lessonId: string, courseId: string): Promise<LessonActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/docente/cursos/${courseId}`);
  return { success: true };
}

export async function reorderLessonsAction(courseId: string, orderedIds: string[]): Promise<LessonActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const results = await Promise.all(
    orderedIds.map((id, index) => supabase.from("lessons").update({ orden: index }).eq("id", id))
  );
  const failed = results.find((r) => r.error);

  if (failed?.error) {
    return { error: failed.error.message };
  }

  revalidatePath(`/docente/cursos/${courseId}`);
  return { success: true };
}
