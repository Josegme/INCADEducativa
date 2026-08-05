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

  const { data: course } = await supabase
    .from("courses")
    .select("es_gratuito, carrera_id")
    .eq("id", courseId)
    .single();

  if (!course) {
    return { error: "El curso no existe" };
  }

  if (!course.es_gratuito) {
    return { error: "Los cursos pagos estarán disponibles en Etapa 3" };
  }

  // Prerequisito de carrera: mismo orden (created_at) que muestra CareerMap
  // (`/carreras/[slug]`). Cursos sin carrera_id ("curso adicional", CU-T01)
  // no tienen prerequisito — se pueden tomar libremente, es a propósito.
  if (course.carrera_id) {
    const { data: careerCourses } = await supabase
      .from("courses")
      .select("id")
      .eq("carrera_id", course.carrera_id)
      .eq("estado", "publicado")
      .order("created_at", { ascending: true });

    const ordered = careerCourses ?? [];
    const index = ordered.findIndex((c) => c.id === courseId);
    const previous = index > 0 ? ordered[index - 1] : null;

    if (previous) {
      const { data: previousEnrollment } = await supabase
        .from("enrollments")
        .select("estado")
        .eq("user_id", user.id)
        .eq("course_id", previous.id)
        .maybeSingle();

      if (previousEnrollment?.estado !== "completado") {
        return { error: "Completá el curso anterior de la carrera antes de avanzar a este" };
      }
    }
  }

  const { error } = await supabase.from("enrollments").insert({ user_id: user.id, course_id: courseId });

  if (error) {
    return { error: error.code === "23505" ? "Ya estás inscripto en este curso" : error.message };
  }

  revalidatePath(`/cursos/${courseSlug}`);
  revalidatePath("/cursos");
  return { success: true };
}
