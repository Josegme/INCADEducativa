import { NextRequest, NextResponse } from "next/server";

import { getPayment } from "@/lib/mercadopago/payment";
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

  let body: { data?: { id?: string } } | null = null;
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
