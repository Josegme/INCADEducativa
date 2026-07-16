import { NextRequest, NextResponse } from "next/server";

import { getPayment } from "@/lib/mercadopago/payment";
import { getSubscription } from "@/lib/mercadopago/subscription";
import { verifyMercadoPagoSignature } from "@/lib/mercadopago/verifySignature";
import { sendEmail } from "@/lib/resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsapp } from "@/lib/twilio";

/**
 * Única fuente de verdad del estado de pago (CLAUDE.md regla #9). Nunca
 * confía en el payload recibido — siempre re-consulta el pago real a la API
 * de MercadoPago antes de tocar `payments`/`bookings`.
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const dataIdFromQuery = url.searchParams.get("data.id");
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  let body: { type?: string; data?: { id?: string } } | null = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const dataId = dataIdFromQuery ?? body?.data?.id ?? null;

  const validSignature = verifyMercadoPagoSignature({ xSignature, xRequestId, dataId });
  if (!validSignature) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  if (!dataId) {
    return NextResponse.json({ error: "Falta data.id" }, { status: 400 });
  }

  const type = body?.type ?? url.searchParams.get("type");

  if (type === "subscription_preapproval") {
    return handleSubscriptionWebhook(dataId);
  }

  const payment = await getPayment(dataId);
  if (!payment || !payment.externalReference) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  }

  const admin = createAdminClient();
  const bookingId = payment.externalReference;

  const estado =
    payment.status === "approved" ? "aprobado" : payment.status === "rejected" ? "rechazado" : "pendiente";

  await admin
    .from("payments")
    .update({ mp_payment_id: payment.id, estado, webhook_payload: payment.raw as object })
    .eq("booking_id", bookingId);

  if (estado === "aprobado") {
    const { data: booking } = await admin
      .from("bookings")
      .update({ estado: "confirmada" })
      .eq("id", bookingId)
      .eq("estado", "pendiente")
      .select("id, user_id, space_id, fecha_inicio, telefono_contacto")
      .maybeSingle();

    if (booking) {
      const [{ data: profile }, { data: space }] = await Promise.all([
        admin.from("users").select("email, nombre").eq("id", booking.user_id).single(),
        admin.from("spaces").select("nombre").eq("id", booking.space_id).single(),
      ]);

      const fecha = new Date(booking.fecha_inicio).toLocaleString("es-AR");
      const espacioNombre = space?.nombre ?? "tu espacio";

      if (profile?.email) {
        await sendEmail({
          to: profile.email,
          subject: "Reserva confirmada — Coworking INCADE",
          html: `<p>Hola ${profile.nombre ?? ""},</p><p>Tu reserva de <strong>${espacioNombre}</strong> para el ${fecha} quedó confirmada. Podés ver el QR de acceso en tu reserva.</p>`,
        });
      }

      if (booking.telefono_contacto) {
        await sendWhatsapp({
          to: booking.telefono_contacto,
          body: `INCADE Coworking: tu reserva de ${espacioNombre} para el ${fecha} quedó confirmada.`,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}

/**
 * Activa/desactiva una membresía según el estado real de la suscripción
 * (nunca confía en el payload — re-consulta a la API de MP, mismo criterio
 * que el pago único). `memberships.mp_preapproval_id` liga la suscripción a
 * la fila creada por `createMembershipAction`.
 */
async function handleSubscriptionWebhook(preapprovalId: string) {
  const subscription = await getSubscription(preapprovalId);
  if (!subscription) {
    return NextResponse.json({ error: "Suscripción no encontrada" }, { status: 404 });
  }

  const admin = createAdminClient();

  const { data: membership } = await admin
    .from("memberships")
    .select("id, user_id, plan_id")
    .eq("mp_preapproval_id", preapprovalId)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "Membresía no encontrada" }, { status: 404 });
  }

  if (subscription.status === "authorized") {
    const { data: plan } = await admin
      .from("membership_plans")
      .select("tipo, creditos_incluidos")
      .eq("id", membership.plan_id)
      .single();

    const inicio = new Date();
    const fin = new Date(inicio);
    if (plan?.tipo === "anual") {
      fin.setFullYear(fin.getFullYear() + 1);
    } else {
      fin.setMonth(fin.getMonth() + 1);
    }

    await admin
      .from("memberships")
      .update({
        activa: true,
        inicio: inicio.toISOString().slice(0, 10),
        fin: fin.toISOString().slice(0, 10),
        creditos_restantes: plan?.creditos_incluidos ?? 0,
      })
      .eq("id", membership.id);

    const { data: profile } = await admin.from("users").select("email, nombre").eq("id", membership.user_id).single();
    if (profile?.email) {
      await sendEmail({
        to: profile.email,
        subject: "Membresía de Coworking activada — INCADE",
        html: `<p>Hola ${profile.nombre ?? ""},</p><p>Tu membresía de Coworking quedó activada.</p>`,
      });
    }
  } else if (subscription.status === "cancelled" || subscription.status === "paused") {
    await admin.from("memberships").update({ activa: false }).eq("id", membership.id);
  }

  return NextResponse.json({ received: true });
}
