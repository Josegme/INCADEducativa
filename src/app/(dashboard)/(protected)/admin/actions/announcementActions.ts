"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notifications";

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
    throw new Error("Solo el administrador puede enviar comunicados");
  }

  return { supabase, adminId: user.id };
}

export interface BroadcastAnnouncementState {
  error?: string;
  success?: boolean;
  recipientCount?: number;
}

export async function broadcastAnnouncementAction(
  courseIds: string[],
  carreraIds: string[],
  titulo: string,
  body: string
): Promise<BroadcastAnnouncementState> {
  const { supabase, adminId } = await requireAdmin();

  if (!titulo.trim() || !body.trim()) {
    return { error: "Completá el título y el mensaje" };
  }

  if (courseIds.length === 0 && carreraIds.length === 0) {
    return { error: "Elegí al menos un curso o una carrera" };
  }

  // Cursos de las carreras elegidas (publicados) se suman a los cursos elegidos directo.
  let courseIdsFromCareers: string[] = [];
  if (carreraIds.length > 0) {
    const { data: careerCourses } = await supabase
      .from("courses")
      .select("id")
      .in("carrera_id", carreraIds)
      .eq("estado", "publicado");
    courseIdsFromCareers = (careerCourses ?? []).map((c) => c.id as string);
  }

  const allCourseIds = Array.from(new Set([...courseIds, ...courseIdsFromCareers]));

  if (allCourseIds.length === 0) {
    return { error: "Las carreras elegidas no tienen cursos publicados" };
  }

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("user_id")
    .in("course_id", allCourseIds);

  if (enrollmentsError) {
    return { error: enrollmentsError.message };
  }

  const userIds = Array.from(new Set((enrollments ?? []).map((e) => e.user_id as string)));

  if (userIds.length === 0) {
    return { error: "Nadie está inscripto en los cursos/carreras elegidos" };
  }

  const { data: recipientRows, error: recipientsError } = await supabase
    .from("users")
    .select("id, email")
    .in("id", userIds);

  if (recipientsError) {
    return { error: recipientsError.message };
  }

  await notifyUsers(supabase, {
    tipo: "announcement",
    senderId: adminId,
    titulo: titulo.trim(),
    cuerpo: body.trim(),
    recipients: (recipientRows ?? []).map((r) => ({ userId: r.id as string, email: r.email as string })),
    emailSubject: `Comunicado de INCADEducativa: ${titulo.trim()}`,
  });

  await logAudit({
    actorId: adminId,
    accion: "comunicado.enviar",
    entidad: "notifications",
    detalle: { courseIds, carreraIds, recipientCount: recipientRows?.length ?? 0 },
  });

  return { success: true, recipientCount: recipientRows?.length ?? 0 };
}
