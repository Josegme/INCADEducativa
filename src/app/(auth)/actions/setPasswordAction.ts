"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

// Política de contraseña Sprint 1a: mínimo 8 caracteres, sin reglas extra.
const schema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export interface SetPasswordState {
  error?: string;
}

export async function setPasswordAction(formData: FormData): Promise<SetPasswordState> {
  const parsed = schema.safeParse({ password: formData.get("password") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Contraseña inválida" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return {
      error: "No pudimos actualizar tu contraseña. Pedí un nuevo link e intentá de nuevo.",
    };
  }

  redirect("/dashboard");
}
