import { NextRequest, NextResponse } from "next/server";

import { notifyUsers } from "@/lib/notifications";
import { sendWhatsapp } from "@/lib/twilio";
import { createAdminClient } from "@/lib/supabase/admin";

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

  return NextResponse.json({
    noShowsDetected: (noShowCount as number) ?? 0,
    bookingsCompleted: (completedCount as number) ?? 0,
    remindersSent,
    noShowsNotified,
  });
}
