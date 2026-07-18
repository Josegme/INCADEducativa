"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface TallerInscripcionState {
  error?: string;
  success?: boolean;
}

/**
 * Sin restricción de rol — cualquier autenticado puede inscribirse, mismo
 * criterio que `enrollments` de cursos. La capacidad se valida acá (no en
 * RLS): es un límite blando, no un recurso físico único como una reserva de
 * Coworking, no hace falta un exclude constraint.
 */
export async function inscribirseTallerAction(tallerId: string): Promise<TallerInscripcionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
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
