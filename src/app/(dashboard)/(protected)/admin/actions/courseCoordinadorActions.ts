"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

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
    throw new Error("Solo el administrador puede asignar coordinadores");
  }

  return { supabase, adminId: user.id };
}

export interface CourseCoordinadoresState {
  error?: string;
  success?: boolean;
}

/** Reemplaza el set completo de coordinadores asignados a un curso (delete + insert). */
export async function setCourseCoordinadoresAction(
  courseId: string,
  coordinadorIds: string[]
): Promise<CourseCoordinadoresState> {
  const { supabase, adminId } = await requireAdmin();

  const { error: deleteError } = await supabase.from("course_coordinadores").delete().eq("course_id", courseId);
  if (deleteError) {
    return { error: deleteError.message };
  }

  if (coordinadorIds.length > 0) {
    const { error: insertError } = await supabase
      .from("course_coordinadores")
      .insert(coordinadorIds.map((coordinadorId) => ({ course_id: courseId, coordinador_id: coordinadorId })));
    if (insertError) {
      return { error: insertError.message };
    }
  }

  await logAudit({
    actorId: adminId,
    accion: "curso.asignar_coordinadores",
    entidad: "courses",
    entidadId: courseId,
    detalle: { coordinadorIds },
  });

  revalidatePath("/admin/cursos");
  return { success: true };
}
