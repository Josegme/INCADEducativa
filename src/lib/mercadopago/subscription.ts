import { PreApproval } from "mercadopago";

import { getMercadoPagoClient } from "./client";

export interface CreateMembershipSubscriptionInput {
  membershipId: string;
  payerEmail: string;
  monto: number;
  reason: string;
}

export interface MembershipSubscriptionResult {
  preapprovalId: string;
  initPoint: string;
}

/**
 * Crea la suscripción (preapproval) de una membresía de Coworking. Devuelve
 * null si MP_ACCESS_TOKEN no está configurada — el llamador debe dejar la
 * membresía en `activa=false` sin preapproval asociado, mismo criterio que
 * createBookingPreference().
 */
export async function createMembershipSubscription(
  input: CreateMembershipSubscriptionInput
): Promise<MembershipSubscriptionResult | null> {
  const client = getMercadoPagoClient();
  if (!client) {
    console.warn(
      `[mercadopago] MP_ACCESS_TOKEN vacía — no se creó suscripción para la membresía ${input.membershipId}`
    );
    return null;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const preApproval = new PreApproval(client);
  const result = await preApproval.create({
    body: {
      reason: input.reason,
      external_reference: input.membershipId,
      payer_email: input.payerEmail,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: input.monto,
        currency_id: "ARS",
      },
      back_url: `${appUrl}/servicios/coworking/membresia/estado/${input.membershipId}`,
    },
  });

  if (!result.id || !result.init_point) {
    console.error(`[mercadopago] Suscripción creada sin id/init_point para ${input.membershipId}`);
    return null;
  }

  return { preapprovalId: result.id, initPoint: result.init_point };
}

export interface MpSubscriptionInfo {
  id: string;
  status: string;
  externalReference: string | null;
}

/**
 * Consulta una suscripción por id — mismo criterio que getPayment(): el
 * webhook nunca confía en el payload de la notificación, siempre re-consulta
 * el estado real a la API de MercadoPago.
 */
export async function getSubscription(preapprovalId: string): Promise<MpSubscriptionInfo | null> {
  const client = getMercadoPagoClient();
  if (!client) return null;

  const preApproval = new PreApproval(client);
  const result = await preApproval.get({ id: preapprovalId });

  if (!result.id) return null;

  return {
    id: result.id,
    status: result.status ?? "unknown",
    externalReference: result.external_reference ?? null,
  };
}
