import { MercadoPagoConfig } from "mercadopago";

let client: MercadoPagoConfig | null | undefined;

/**
 * null si MP_ACCESS_TOKEN no está configurada (dev sin credenciales) — los
 * llamadores deben degradar con gracia (reserva queda `pendiente` sin
 * preferencia de pago), nunca tirar la acción.
 */
export function getMercadoPagoClient(): MercadoPagoConfig | null {
  if (client === undefined) {
    client = process.env.MP_ACCESS_TOKEN
      ? new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
      : null;
  }
  return client;
}
