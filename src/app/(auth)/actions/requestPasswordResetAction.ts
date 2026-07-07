"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email("Ingresá un email válido"),
});

export interface RequestPasswordResetState {
  error?: string;
  success?: boolean;
}

export async function requestPasswordResetAction(
  formData: FormData
): Promise<RequestPasswordResetState> {
  const parsed = schema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Email inválido" };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl}/auth/confirm?type=recovery&next=/actualizar-password`,
  });

  // Siempre respondemos éxito, exista o no el email, para no filtrar
  // qué direcciones están registradas en la plataforma.
  return { success: true };
}
