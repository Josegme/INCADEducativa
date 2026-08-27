"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_EVALUATION_CONFIG,
  type EvaluationConfig,
  type EvaluationQuestion,
  type EvaluationTipo,
} from "@/modules/docente/evaluationEditor";

export interface EvaluationActionState {
  error?: string;
  success?: boolean;
  id?: string;
}

export async function createEvaluationAction(
  courseId: string,
  moduleId: string | null,
  tipo: EvaluationTipo,
  titulo: string
): Promise<EvaluationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { data, error } = await supabase
    .from("evaluations")
    .insert({
      course_id: courseId,
      module_id: moduleId,
      tipo,
      titulo,
      preguntas: [],
      config: DEFAULT_EVALUATION_CONFIG,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/docente/cursos/${courseId}`);
  return { success: true, id: data.id as string };
}

export interface EvaluationUpdateInput {
  titulo: string;
  preguntas: EvaluationQuestion[];
  nota_minima: number;
  config: EvaluationConfig;
}

export async function updateEvaluationAction(
  evaluationId: string,
  courseId: string,
  data: EvaluationUpdateInput
): Promise<EvaluationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase
    .from("evaluations")
    .update({
      titulo: data.titulo,
      preguntas: data.preguntas,
      nota_minima: data.nota_minima,
      config: data.config,
    })
    .eq("id", evaluationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/docente/cursos/${courseId}`);
  revalidatePath(`/docente/cursos/${courseId}/evaluaciones/${evaluationId}`);
  return { success: true };
}

export async function deleteEvaluationAction(evaluationId: string, courseId: string): Promise<EvaluationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase.from("evaluations").delete().eq("id", evaluationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/docente/cursos/${courseId}`);
  return { success: true };
}
