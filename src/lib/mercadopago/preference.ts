import { Preference } from "mercadopago";

import { getMercadoPagoClient } from "./client";

export interface CreateBookingPreferenceInput {
  bookingId: string;
  title: string;
  unitPrice: number;
  payerEmail: string;
}

export interface BookingPreferenceResult {
  preferenceId: string;
  initPoint: string;
}

/**
 * Crea la preferencia de checkout para una reserva de Coworking. Devuelve
 * null si MP_ACCESS_TOKEN no está configurada — el llamador debe dejar la
 * reserva en `pendiente` sin preferencia asociada en vez de fallar.
 */
export async function createBookingPreference(
  input: CreateBookingPreferenceInput
): Promise<BookingPreferenceResult | null> {
  const client = getMercadoPagoClient();
  if (!client) {
    console.warn(
      `[mercadopago] MP_ACCESS_TOKEN vacía — no se creó preferencia para la reserva ${input.bookingId}`
    );
    return null;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const returnUrl = `${appUrl}/servicios/coworking/reservas/${input.bookingId}`;

  const preference = new Preference(client);
  const result = await preference.create({
    body: {
      items: [
        {
          id: input.bookingId,
          title: input.title,
          quantity: 1,
          unit_price: input.unitPrice,
          currency_id: "ARS",
        },
      ],
      payer: { email: input.payerEmail },
      external_reference: input.bookingId,
      notification_url: `${appUrl}/api/mercadopago/webhook`,
      back_urls: {
        success: returnUrl,
        pending: returnUrl,
        failure: returnUrl,
      },
      auto_return: "approved",
    },
  });

  if (!result.id || !result.init_point) {
    console.error(`[mercadopago] Preferencia creada sin id/init_point para ${input.bookingId}`);
    return null;
  }

  return { preferenceId: result.id, initPoint: result.init_point };
}
