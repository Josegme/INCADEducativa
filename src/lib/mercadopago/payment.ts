import { Payment } from "mercadopago";

import { getMercadoPagoClient } from "./client";

export interface MpPaymentInfo {
  id: string;
  status: string;
  externalReference: string | null;
  raw: unknown;
}

/**
 * Consulta un pago por id a la API de MercadoPago. El webhook nunca confía
 * en el payload que le llega directo — siempre re-consulta el estado real
 * (CLAUDE.md regla #9: el webhook es la única fuente de verdad, pero la
 * fuente real del estado es la API de MP, no la notificación en sí).
 */
export async function getPayment(paymentId: string): Promise<MpPaymentInfo | null> {
  const client = getMercadoPagoClient();
  if (!client) return null;

  const payment = new Payment(client);
  const result = await payment.get({ id: paymentId });

  if (!result.id) return null;

  return {
    id: String(result.id),
    status: result.status ?? "unknown",
    externalReference: result.external_reference ?? null,
    raw: result,
  };
}
