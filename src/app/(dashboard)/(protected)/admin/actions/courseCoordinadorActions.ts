"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { logAudit } from "@/lib/audit";

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
