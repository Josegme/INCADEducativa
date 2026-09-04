import { NextRequest, NextResponse } from "next/server";

import { getPayment, type MpPaymentInfo } from "@/lib/mercadopago/payment";
import { getSubscription } from "@/lib/mercadopago/subscription";
import { verifyMercadoPagoSignature } from "@/lib/mercadopago/verifySignature";
import { notifyUsers } from "@/lib/notifications";
import { sendEmail } from "@/lib/resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsapp } from "@/lib/twilio";
import { resolveTutoriaAddonEstado } from "@/modules/educativa/tutoriaAddon";

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
    // Suscripción al catálogo educativo (Etapa 3) vs membresía de Coworking
    // — no se puede prefijar el preapproval id (lo genera MP), así que se
    // distingue con una consulta barata por mp_preapproval_id. Si no
    // aparece en catalogo_suscripciones, es una membresía de Coworking —
    // handleSubscriptionWebhook queda sin tocar ni un carácter.
    const { data: catalogSub } = await createAdminClient()
      .from("catalogo_suscripciones")
      .select("id")
      .eq("mp_preapproval_id", dataId)
      .maybeSingle();

    if (catalogSub) {
      return handleCourseSubscriptionWebhook(dataId, catalogSub.id as string);
    }

    return handleSubscriptionWebhook(dataId);
  }

  const payment = await getPayment(dataId);
  if (!payment || !payment.externalReference) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  }

  const admin = createAdminClient();

  // Compra de curso individual (Etapa 3) — prefijo `curso:` en
  // external_reference, ver createCoursePreference(). El resto de este
  // handler (bookings de Coworking) queda sin tocar: bookingId sigue siendo
  // el external_reference pelado, exactamente como antes.
  if (payment.externalReference.startsWith("curso:")) {
    return handleCoursePurchaseWebhook(admin, payment, payment.externalReference.slice("curso:".length));
  }

  // Add-on de tutorías (T13, Etapa 3) — prefijo `tutoria-addon:`. Distinto
  // de `curso:`: no toca `enrollments` (el usuario ya está inscripto),
  // solo aprueba la fila de `tutoria_addon_compras` que lee
  // has_tutoria_addon_access().
  if (payment.externalReference.startsWith("tutoria-addon:")) {
    return handleTutoriaAddonPurchaseWebhook(
      admin,
      payment,
      payment.externalReference.slice("tutoria-addon:".length)
    );
  }

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
      .select("id, user_id, space_id, fecha_inicio, telefono_contacto, monto")
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

        // Comprobante de pago — distinto del email de confirmación de
        // arriba: es el registro del pago en sí (monto, referencia MP),
        // no solo el aviso de que la reserva quedó confirmada.
        await notifyUsers(admin, {
          tipo: "pago",
          referenciaId: booking.id,
          titulo: `Comprobante de pago — ${espacioNombre}`,
          cuerpo: `Pagaste $${booking.monto} por tu reserva de ${espacioNombre} del ${fecha}.`,
          recipients: [
            {
              userId: booking.user_id,
              email: profile.email as string,
              emailHtml: `<p>Hola ${profile.nombre ?? ""},</p><p>Este es tu comprobante de pago.</p><ul><li>Espacio: ${espacioNombre}</li><li>Fecha: ${fecha}</li><li>Monto: $${booking.monto}</li><li>Referencia de pago (MercadoPago): ${payment.id}</li></ul>`,
            },
          ],
          emailSubject: "Comprobante de pago — Coworking INCADE",
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
 * Compra individual de un curso (Etapa 3). `compras_curso` juega el doble
 * rol que Coworking separa en dos tablas (payments + bookings) — acá no
 * hay contención de recurso físico que justifique separarlas, así que el
 * guard de idempotencia (`.eq("estado","pendiente")`) se colapsa en una
 * sola tabla.
 */
async function handleCoursePurchaseWebhook(
  admin: ReturnType<typeof createAdminClient>,
  payment: MpPaymentInfo,
  compraId: string
) {
  const estado =
    payment.status === "approved" ? "aprobado" : payment.status === "rejected" ? "rechazado" : "pendiente";

  const { data: compra } = await admin
    .from("compras_curso")
    .update({ mp_payment_id: payment.id, estado, webhook_payload: payment.raw as object })
    .eq("id", compraId)
    .eq("estado", "pendiente")
    .select("id, user_id, course_id, monto")
    .maybeSingle();

  if (!compra || estado !== "aprobado") {
    return NextResponse.json({ received: true });
  }

  // Idempotente: si el usuario ya tiene esta inscripción por otra vía, el
  // unique(user_id, course_id) de enrollments rechaza el insert sin romper
  // el resto del flujo.
  await admin.from("enrollments").insert({ user_id: compra.user_id, course_id: compra.course_id });

  const [{ data: profile }, { data: course }] = await Promise.all([
    admin.from("users").select("email, nombre, role").eq("id", compra.user_id).single(),
    admin.from("courses").select("titulo, slug").eq("id", compra.course_id).single(),
  ]);

  if (profile?.role === "lead") {
    await admin.rpc("promote_lead_on_course_payment", { p_user_id: compra.user_id, p_compra_id: compra.id });
  }

  if (profile?.email) {
    await notifyUsers(admin, {
      tipo: "pago",
      referenciaId: compra.id,
      courseId: compra.course_id,
      titulo: `Pago aprobado — ${course?.titulo ?? "tu curso"}`,
      cuerpo: `Pagaste $${compra.monto} por "${course?.titulo}". Ya podés acceder desde tu dashboard.`,
      recipients: [
        {
          userId: compra.user_id,
          email: profile.email as string,
          emailHtml: `<p>Hola ${profile.nombre ?? ""},</p><p>Tu compra de <strong>${course?.titulo}</strong> quedó confirmada. Monto: $${compra.monto}. Referencia de pago (MercadoPago): ${payment.id}.</p>`,
        },
      ],
      emailSubject: "Compra confirmada — INCADEducativa",
    });
  }

  return NextResponse.json({ received: true });
}

/**
 * Add-on de tutorías por curso (T13, Etapa 3). El usuario ya está
 * inscripto (compró o se suscribió al curso) — este handler solo aprueba
 * la fila de `tutoria_addon_compras`; `has_tutoria_addon_access()` la lee
 * directo, no hace falta tocar `enrollments` ni ninguna otra tabla.
 */
async function handleTutoriaAddonPurchaseWebhook(
  admin: ReturnType<typeof createAdminClient>,
  payment: MpPaymentInfo,
  compraId: string
) {
  const estado = resolveTutoriaAddonEstado(payment.status);

  const { data: compra } = await admin
    .from("tutoria_addon_compras")
    .update({ mp_payment_id: payment.id, estado, webhook_payload: payment.raw as object })
    .eq("id", compraId)
    .eq("estado", "pendiente")
    .select("id, user_id, course_id, monto")
    .maybeSingle();

  if (!compra || estado !== "aprobado") {
    return NextResponse.json({ received: true });
  }

  const [{ data: profile }, { data: course }] = await Promise.all([
    admin.from("users").select("email, nombre").eq("id", compra.user_id).single(),
    admin.from("courses").select("titulo").eq("id", compra.course_id).single(),
  ]);

  if (profile?.email) {
    await notifyUsers(admin, {
      tipo: "pago",
      referenciaId: compra.id,
      courseId: compra.course_id,
      titulo: `Add-on de tutorías activado — ${course?.titulo ?? "tu curso"}`,
      cuerpo: `Pagaste $${compra.monto} por el add-on de tutorías de "${course?.titulo}". Ya podés acceder a las tutorías de ese curso.`,
      recipients: [
        {
          userId: compra.user_id,
          email: profile.email as string,
          emailHtml: `<p>Hola ${profile.nombre ?? ""},</p><p>Tu compra del add-on de tutorías de <strong>${course?.titulo}</strong> quedó confirmada. Monto: $${compra.monto}. Referencia de pago (MercadoPago): ${payment.id}.</p>`,
        },
      ],
      emailSubject: "Add-on de tutorías activado — INCADEducativa",
    });
  }

  return NextResponse.json({ received: true });
}

/**
 * Suscripción mensual al catálogo educativo (Etapa 3). Mismo cuerpo que
 * handleSubscriptionWebhook (Coworking) pero sin el concepto de créditos —
 * acá "activa" solo da acceso al catálogo, no consume nada. Siempre mensual
 * (sin chequear ningún `tipo`, a diferencia de las membresías).
 */
async function handleCourseSubscriptionWebhook(preapprovalId: string, suscripcionId: string) {
  const subscription = await getSubscription(preapprovalId);
  if (!subscription) {
    return NextResponse.json({ error: "Suscripción no encontrada" }, { status: 404 });
  }

  const admin = createAdminClient();

  if (subscription.status === "authorized") {
    const inicio = new Date();
    const fin = new Date(inicio);
    fin.setMonth(fin.getMonth() + 1);

    await admin
      .from("catalogo_suscripciones")
      .update({
        activa: true,
        inicio: inicio.toISOString().slice(0, 10),
        fin: fin.toISOString().slice(0, 10),
      })
      .eq("id", suscripcionId);

    const { data: sub } = await admin
      .from("catalogo_suscripciones")
      .select("user_id")
      .eq("id", suscripcionId)
      .single();

    const { data: profile } = sub
      ? await admin.from("users").select("email, nombre").eq("id", sub.user_id).single()
      : { data: null };

    if (profile?.email) {
      await sendEmail({
        to: profile.email,
        subject: "Suscripción al catálogo activada — INCADEducativa",
        html: `<p>Hola ${profile.nombre ?? ""},</p><p>Tu suscripción mensual al catálogo educativo quedó activada. Ya podés acceder a los cursos pagos.</p>`,
      });
    }
  } else if (subscription.status === "cancelled" || subscription.status === "paused") {
    await admin.from("catalogo_suscripciones").update({ activa: false }).eq("id", suscripcionId);
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
