"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface EnrollState {
  error?: string;
  success?: boolean;
}

/** CU-T01: cursos gratuitos, incluso fuera de la carrera del alumno (quedan como "curso adicional"). */
export async function enrollUserAction(courseId: string, courseSlug: string): Promise<EnrollState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { data: course } = await supabase.from("courses").select("es_gratuito").eq("id", courseId).single();

  if (!course) {
    return { error: "El curso no existe" };
  }

  if (!course.es_gratuito) {
    return { error: "Los cursos pagos estarán disponibles en Etapa 3" };
  }

  const { error } = await supabase.from("enrollments").insert({ user_id: user.id, course_id: courseId });

  if (error) {
    return { error: error.code === "23505" ? "Ya estás inscripto en este curso" : error.message };
  }

  revalidatePath(`/cursos/${courseSlug}`);
  revalidatePath("/cursos");
  return { success: true };
}
