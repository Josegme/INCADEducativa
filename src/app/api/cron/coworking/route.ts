import { NextRequest, NextResponse } from "next/server";

import { notifyUsers } from "@/lib/notifications";
import { sendWhatsapp } from "@/lib/twilio";
import { createAdminClient } from "@/lib/supabase/admin";
import { BOOKING_OPEN_HOUR, BOOKING_CLOSE_HOUR } from "@/modules/coworking/booking";

/**
 * Disparado por pg_cron + pg_net (migración 016) cada ~10 min, o a mano con
 * curl mientras no haya deploy (pg_net no puede alcanzar localhost). La
 * lógica de negocio vive acá en TypeScript — reusa notifyUsers/sendWhatsapp
 * tal cual, no se duplica en SQL — el cron solo dispara.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: noShowCount } = await admin.rpc("detect_no_shows");
  const { data: completedCount } = await admin.rpc("detect_completed_bookings");

  const now = new Date();
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const { data: dueForReminder } = await admin
    .from("bookings")
    .select("id, user_id, space_id, fecha_inicio, telefono_contacto")
    .eq("estado", "confirmada")
    .eq("recordatorio_enviado", false)
    .gte("fecha_inicio", windowStart.toISOString())
    .lte("fecha_inicio", windowEnd.toISOString());

  let remindersSent = 0;
  for (const booking of dueForReminder ?? []) {
    const [{ data: profile }, { data: space }] = await Promise.all([
      admin.from("users").select("email, nombre").eq("id", booking.user_id).single(),
      admin.from("spaces").select("nombre").eq("id", booking.space_id).single(),
    ]);

    const fecha = new Date(booking.fecha_inicio).toLocaleString("es-AR");
    const espacioNombre = space?.nombre ?? "tu espacio";

    if (profile?.email) {
      await notifyUsers(admin, {
        tipo: "reserva",
        referenciaId: booking.id,
        titulo: `Recordatorio: reserva de ${espacioNombre} mañana`,
        cuerpo: `Tu reserva de ${espacioNombre} es el ${fecha}.`,
        recipients: [{ userId: booking.user_id, email: profile.email as string }],
        emailSubject: "Recordatorio de tu reserva — Coworking INCADE",
      });
    }

    if (booking.telefono_contacto) {
      await sendWhatsapp({
        to: booking.telefono_contacto,
        body: `INCADE Coworking: te recordamos tu reserva de ${espacioNombre} para el ${fecha}.`,
      });
    }

    await admin.from("bookings").update({ recordatorio_enviado: true }).eq("id", booking.id);
    remindersSent++;
  }

  const { data: dueForNoShowNotice } = await admin
    .from("bookings")
    .select("id, user_id, space_id, fecha_inicio")
    .eq("estado", "no_show")
    .eq("no_show_notificado", false);

  let noShowsNotified = 0;
  for (const booking of dueForNoShowNotice ?? []) {
    const [{ data: profile }, { data: space }] = await Promise.all([
      admin.from("users").select("email, nombre").eq("id", booking.user_id).single(),
      admin.from("spaces").select("nombre").eq("id", booking.space_id).single(),
    ]);

    if (profile?.email) {
      await notifyUsers(admin, {
        tipo: "reserva",
        referenciaId: booking.id,
        titulo: `No te presentaste a tu reserva de ${space?.nombre ?? "tu espacio"}`,
        cuerpo: `Marcamos como no-show tu reserva del ${new Date(booking.fecha_inicio).toLocaleString("es-AR")}.`,
        recipients: [{ userId: booking.user_id, email: profile.email as string }],
        emailSubject: "No-show en tu reserva de Coworking",
      });
    }

    await admin.from("bookings").update({ no_show_notificado: true }).eq("id", booking.id);
    noShowsNotified++;
  }

  // Resumen diario 08:00 + informe de ociosos lunes 09:00 — el cron corre
  // cada ~10 min (pg_net, migración 016), no hay una fila por evento para
  // dedupear como arriba, así que alcanza con un gate de hora+minuto: a esa
  // cadencia el rango "primeros 10 min de la hora" dispara una sola vez por
  // día en la práctica.
  const nowInBA = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  const hour = nowInBA.getHours();
  const minute = nowInBA.getMinutes();
  const weekday = nowInBA.getDay(); // 0=domingo, 1=lunes

  let dailySummarySent = false;
  let idleReportSent = false;

  if (hour === 8 && minute < 10) {
    dailySummarySent = await sendDailySummary(admin, now);
  }

  if (weekday === 1 && hour === 9 && minute < 10) {
    idleReportSent = await sendIdleSpacesReport(admin, now);
  }

  return NextResponse.json({
    noShowsDetected: (noShowCount as number) ?? 0,
    bookingsCompleted: (completedCount as number) ?? 0,
    remindersSent,
    noShowsNotified,
    dailySummarySent,
    idleReportSent,
  });
}

async function notifyAdmins(admin: ReturnType<typeof createAdminClient>, titulo: string, cuerpo: string) {
  const { data: admins } = await admin.from("users").select("id, email").eq("role", "admin");
  if (!admins || admins.length === 0) return false;

  await notifyUsers(admin, {
    tipo: "sistema",
    titulo,
    cuerpo,
    recipients: admins.map((a) => ({ userId: a.id as string, email: a.email as string })),
    emailSubject: titulo,
  });
  return true;
}

async function sendDailySummary(admin: ReturnType<typeof createAdminClient>, now: Date) {
  // dayStart/dayEnd tienen que ser la medianoche real de Buenos Aires, no la
  // del runtime (UTC en Vercel) — `setHours` sobre un Date siempre opera en
  // la zona local del proceso, así que arrancar desde un Date "corrido" a
  // BA (como nowInBA en el handler) igual da 00:00 UTC, que es 21:00 ART del
  // día anterior, no 00:00 ART. Se arma el string ISO con el offset de
  // Argentina explícito (-03:00, fijo todo el año, sin DST) para anclar el
  // instante real sin depender de la zona horaria del runtime.
  const baDateStr = now.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
  const dayStart = new Date(`${baDateStr}T00:00:00-03:00`);
  const dayEnd = new Date(dayStart.getTime() + 86400000);

  const { data: bookings } = await admin
    .from("bookings")
    .select("estado, monto")
    .gte("fecha_inicio", dayStart.toISOString())
    .lt("fecha_inicio", dayEnd.toISOString());

  const rows = bookings ?? [];
  const total = rows.length;
  const confirmadas = rows.filter((b) => b.estado === "confirmada" || b.estado === "en_uso" || b.estado === "completada").length;
  const canceladas = rows.filter((b) => b.estado === "cancelada").length;
  const ingresos = rows
    .filter((b) => b.estado !== "cancelada" && b.estado !== "pendiente")
    .reduce((sum, b) => sum + (b.monto as number), 0);

  return notifyAdmins(
    admin,
    `Resumen diario Coworking — ${dayStart.toLocaleDateString("es-AR")}`,
    `Reservas de hoy: ${total} (${confirmadas} confirmadas, ${canceladas} canceladas). Ingresos: $${ingresos}.`
  );
}

async function sendIdleSpacesReport(admin: ReturnType<typeof createAdminClient>, now: Date) {
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  const [{ data: spaces }, { data: bookings }] = await Promise.all([
    admin.from("spaces").select("id, nombre").eq("activo", true),
    admin
      .from("bookings")
      .select("space_id, fecha_inicio, fecha_fin")
      .in("estado", ["confirmada", "en_uso", "completada"])
      .gte("fecha_inicio", weekAgo.toISOString()),
  ]);

  const spaceRows = spaces ?? [];
  if (spaceRows.length === 0) return false;

  const hoursBySpace = new Map<string, number>();
  for (const b of bookings ?? []) {
    const hours = (new Date(b.fecha_fin).getTime() - new Date(b.fecha_inicio).getTime()) / (1000 * 60 * 60);
    hoursBySpace.set(b.space_id, (hoursBySpace.get(b.space_id) ?? 0) + hours);
  }

  const availableHoursPerWeek = (BOOKING_CLOSE_HOUR - BOOKING_OPEN_HOUR) * 7;
  const ranked = spaceRows
    .map((s) => {
      const booked = hoursBySpace.get(s.id) ?? 0;
      return { nombre: s.nombre as string, ocupacionPct: Math.round((booked / availableHoursPerWeek) * 100) };
    })
    .sort((a, b) => a.ocupacionPct - b.ocupacionPct);

  const cuerpo = ranked.map((r) => `${r.nombre}: ${r.ocupacionPct}% de ocupación`).join(" · ");

  return notifyAdmins(admin, "Informe semanal de espacios ociosos — Coworking", cuerpo);
}
