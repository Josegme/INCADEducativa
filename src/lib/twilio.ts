import twilio from "twilio";

let client: ReturnType<typeof twilio> | null | undefined;

function getClient() {
  if (client === undefined) {
    client =
      process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
        ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
        : null;
  }
  return client;
}

export interface SendWhatsappInput {
  to: string;
  body: string;
}

/**
 * No-op si TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN no están configuradas (dev sin
 * credenciales) — nunca tira la acción del llamador, solo loguea.
 */
export async function sendWhatsapp({ to, body }: SendWhatsappInput): Promise<void> {
  const twilioClient = getClient();
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!twilioClient || !from) {
    console.warn(`[twilio] Credenciales vacías — no se envió WhatsApp a ${to}: "${body}"`);
    return;
  }

  try {
    await twilioClient.messages.create({
      from: `whatsapp:${from}`,
      to: `whatsapp:${to}`,
      body,
    });
  } catch (error) {
    console.error(`[twilio] Error enviando WhatsApp a ${to}:`, error);
  }
}
