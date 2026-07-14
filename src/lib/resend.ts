import { Resend } from "resend";

let client: Resend | null | undefined;

function getClient() {
  if (client === undefined) {
    client = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  }
  return client;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * No-op si RESEND_API_KEY no está configurada (dev sin credenciales) —
 * nunca tira la acción del llamador, solo loguea.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  const resend = getClient();

  if (!resend) {
    console.warn(`[resend] RESEND_API_KEY vacía — no se envió email a ${to}: "${subject}"`);
    return;
  }

  const { error } = await resend.emails.send({
    from: "INCADEducativa <notificaciones@incadeducativa.com>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error(`[resend] Error enviando email a ${to}:`, error);
  }
}
