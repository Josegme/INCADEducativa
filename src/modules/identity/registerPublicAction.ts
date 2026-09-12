"use server";

import { redirect } from "next/navigation";

import { fail, ok, type ActionResult } from "@/lib/actions/result";
import { getFlags } from "@/lib/flags";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { registerFieldsSchema } from "@/modules/identity";

export async function registerPublicAction(formData: FormData): Promise<ActionResult> {
  const flags = await getFlags();
  if (!flags.publica) {
    return fail("El registro libre todavía no está habilitado");
  }

  const parsed = registerFieldsSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const { nombre, email, password } = parsed.data;
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: existing } = await admin.from("users").select("id").eq("email", email.toLowerCase()).maybeSingle();
  if (existing) {
    return fail("Ya existe una cuenta con ese email — iniciá sesión");
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return fail("No se pudo crear la cuenta");
  }

  const [first, ...rest] = nombre.trim().split(/\s+/);
  const { error: insertError } = await admin.from("users").insert({
    id: created.user.id,
    email,
    nombre: first,
    apellido: rest.join(" "),
    role: "comunidad",
  });

  if (insertError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return fail("No se pudo crear tu perfil");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    return fail("Cuenta creada, iniciá sesión manualmente");
  }

  redirect("/dashboard");
  return ok();
}
