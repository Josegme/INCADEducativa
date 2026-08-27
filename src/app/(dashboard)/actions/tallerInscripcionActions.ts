"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registerFieldsSchema } from "@/modules/coworking/booking";

export interface TallerInscripcionState {
  error?: string;
  success?: boolean;
}

/**
 * Sin restricción de rol — cualquier autenticado puede inscribirse, mismo
 * criterio que `enrollments` de cursos. La capacidad se valida acá (no en
 * RLS): es un límite blando, no un recurso físico único como una reserva de
 * Coworking, no hace falta un exclude constraint.
 *
 * Segunda excepción acotada a la regla #2 de CLAUDE.md (la primera es
 * Coworking CU-06): un visitante sin cuenta puede registrarse como `lead`
 * como parte de inscribirse a un taller gratuito — mismo patrón de registro
 * inline que `createBookingAction`.
 */
export async function inscribirseTallerAction(
  tallerId: string,
  registro?: { nombre: string; email: string; password: string }
): Promise<TallerInscripcionState> {
  const supabase = await createClient();
  let {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (!registro) {
      return { error: "Completá tus datos para inscribirte" };
    }

    const registerParsed = registerFieldsSchema.safeParse(registro);
    if (!registerParsed.success) {
      return { error: registerParsed.error.issues[0]?.message ?? "Completá tus datos para inscribirte" };
    }
    const { nombre, email, password } = registerParsed.data;

    const admin = createAdminClient();

    const { data: existing } = await admin.from("users").select("id").eq("email", email.toLowerCase()).maybeSingle();
    if (existing) {
      return { error: "Ya existe una cuenta con ese email — iniciá sesión para inscribirte" };
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError || !created.user) {
      return { error: "No se pudo crear la cuenta — probá con otro email" };
    }

    const [first, ...rest] = nombre.trim().split(/\s+/);
    const { error: insertError } = await admin.from("users").insert({
      id: created.user.id,
      email,
      nombre: first,
      apellido: rest.join(" "),
      role: "lead",
    });

    if (insertError) {
      await admin.auth.admin.deleteUser(created.user.id);
      return { error: "No se pudo crear tu perfil — intentá de nuevo" };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      return { error: "Cuenta creada, pero no se pudo iniciar sesión — probá ingresar manualmente" };
    }

    user = (await supabase.auth.getUser()).data.user;
  }

  if (!user) {
    return { error: "No se pudo identificar tu sesión" };
  }

  const { data: taller } = await supabase
    .from("talleres")
    .select("capacidad, estado")
    .eq("id", tallerId)
    .single();

  if (!taller || taller.estado !== "publicado") {
    return { error: "Este taller ya no está disponible" };
  }

  if (taller.capacidad !== null) {
    // La RLS de taller_inscripciones solo deja ver la fila propia — se usa
    // la función security definer para contar el total real (ver 019).
    const { data: count } = await supabase.rpc("get_taller_inscripcion_count", { p_taller_id: tallerId });

    if ((count ?? 0) >= taller.capacidad) {
      return { error: "El taller ya alcanzó su capacidad máxima" };
    }
  }

  const { error } = await supabase.from("taller_inscripciones").insert({
    taller_id: tallerId,
    user_id: user.id,
  });

  if (error) {
    return { error: error.code === "23505" ? "Ya estás inscripto en este taller" : error.message };
  }

  revalidatePath("/talleres");
  return { success: true };
}

export async function desinscribirseTallerAction(tallerId: string): Promise<TallerInscripcionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase
    .from("taller_inscripciones")
    .delete()
    .eq("taller_id", tallerId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/talleres");
  return { success: true };
}
