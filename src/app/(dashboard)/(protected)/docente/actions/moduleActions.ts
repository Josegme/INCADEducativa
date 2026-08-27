"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface ModuleActionState {
  error?: string;
  success?: boolean;
}

export async function createModuleAction(courseId: string, titulo: string, orden: number): Promise<ModuleActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase.from("modules").insert({ course_id: courseId, titulo, orden });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/docente/cursos/${courseId}`);
  return { success: true };
}

export async function updateModuleAction(moduleId: string, courseId: string, titulo: string): Promise<ModuleActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase.from("modules").update({ titulo }).eq("id", moduleId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/docente/cursos/${courseId}`);
  return { success: true };
}

export async function deleteModuleAction(moduleId: string, courseId: string): Promise<ModuleActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase.from("modules").delete().eq("id", moduleId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/docente/cursos/${courseId}`);
  return { success: true };
}

export async function reorderModulesAction(courseId: string, orderedIds: string[]): Promise<ModuleActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const results = await Promise.all(
    orderedIds.map((id, index) => supabase.from("modules").update({ orden: index }).eq("id", id))
  );
  const failed = results.find((r) => r.error);

  if (failed?.error) {
    return { error: failed.error.message };
  }

  revalidatePath(`/docente/cursos/${courseId}`);
  return { success: true };
}
