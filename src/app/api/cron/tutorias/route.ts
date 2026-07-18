import { NextRequest, NextResponse } from "next/server";

import { notifyUsers } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { reminderWindow } from "@/modules/tutorias/tutorias";

/**
 * Disparado por pg_cron + pg_net (migración 018) cada ~10 min, o a mano con
 * curl mientras no haya deploy (pg_net no puede alcanzar localhost) — mismo
 * patrón que /api/cron/coworking. Recordatorios por Email + in-app (WhatsApp
 * diferido, ver Addendum 05 — `users` no tiene campo de teléfono todavía).
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: completedCount } = await admin.rpc("detect_completed_tutorias");

  let reminders24h = 0;
  let reminders1h = 0;

  for (const { hours, flagColumn } of [
    { hours: 24, flagColumn: "recordatorio_24h_enviado" as const },
    { hours: 1, flagColumn: "recordatorio_1h_enviado" as const },
  ]) {
    const { from, to } = reminderWindow(hours);

    const { data: dueTutorias } = await admin
      .from("tutorias")
      .select("id, curso_id, docente_id, modalidad, fecha_inicio, link_virtual")
      .eq("estado", "programada")
      .eq(flagColumn, false)
      .gte("fecha_inicio", from.toISOString())
      .lte("fecha_inicio", to.toISOString());

    for (const tutoria of dueTutorias ?? []) {
      const [{ data: course }, { data: enrollments }, { data: docente }] = await Promise.all([
        admin.from("courses").select("titulo").eq("id", tutoria.curso_id).single(),
        admin.from("enrollments").select("user_id").eq("course_id", tutoria.curso_id),
        admin.from("users").select("id, email").eq("id", tutoria.docente_id).single(),
      ]);

      const alumnoIds = (enrollments ?? []).map((e) => e.user_id as string);
      const { data: alumnos } = alumnoIds.length
        ? await admin.from("users").select("id, email").in("id", alumnoIds)
        : { data: [] };

      const recipients = [...(alumnos ?? []), ...(docente ? [docente] : [])].map((r) => ({
        userId: r.id as string,
        email: r.email as string,
      }));

      const fechaLabel = new Date(tutoria.fecha_inicio).toLocaleString("es-AR");
      const cursoTitulo = course?.titulo ?? "tu curso";

      if (recipients.length > 0) {
        await notifyUsers(admin, {
          tipo: "tutoria",
          courseId: tutoria.curso_id,
          referenciaId: tutoria.id,
          titulo: `Recordatorio: tutoría de ${cursoTitulo} en ${hours}hs`,
          cuerpo: `Tutoría ${tutoria.modalidad} el ${fechaLabel}.`,
          recipients,
          emailSubject: `Recordatorio: tutoría de ${cursoTitulo}`,
        });
      }

      await admin.from("tutorias").update({ [flagColumn]: true }).eq("id", tutoria.id);
      if (hours === 24) reminders24h++;
      else reminders1h++;
    }
  }

  return NextResponse.json({
    tutoriasCompletadas: (completedCount as number) ?? 0,
    reminders24h,
    reminders1h,
  });
}
