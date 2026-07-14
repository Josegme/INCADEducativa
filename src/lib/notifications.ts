import type { SupabaseClient } from "@supabase/supabase-js";

import { sendEmail } from "@/lib/resend";
import type { NotificationType } from "@/modules/comunicacion/types";

export interface NotifyRecipient {
  userId: string;
  email: string;
  emailHtml?: string;
}

export interface NotifyInput {
  tipo: NotificationType;
  courseId?: string | null;
  senderId?: string | null;
  referenciaId?: string | null;
  titulo: string;
  cuerpo?: string | null;
  recipients: NotifyRecipient[];
  emailSubject?: string;
}

/**
 * Inserta una notificación in-app por destinatario y, si se pasa emailSubject,
 * dispara el email (Resend) en paralelo — best-effort, nunca tira la acción
 * del llamador si un email falla.
 */
export async function notifyUsers(supabase: SupabaseClient, input: NotifyInput): Promise<void> {
  if (input.recipients.length === 0) return;

  const { error } = await supabase.from("notifications").insert(
    input.recipients.map((r) => ({
      user_id: r.userId,
      tipo: input.tipo,
      course_id: input.courseId ?? null,
      sender_id: input.senderId ?? null,
      referencia_id: input.referenciaId ?? null,
      titulo: input.titulo,
      cuerpo: input.cuerpo ?? null,
    }))
  );

  if (error) {
    console.error("[notifications] Error insertando notificaciones:", error);
  }

  if (!input.emailSubject) return;

  await Promise.allSettled(
    input.recipients.map((r) =>
      sendEmail({
        to: r.email,
        subject: input.emailSubject!,
        html: r.emailHtml ?? `<p>${input.cuerpo ?? input.titulo}</p>`,
      })
    )
  );
}
