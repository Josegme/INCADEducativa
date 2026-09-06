"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface ForoActionState {
  error?: string;
  success?: boolean;
}

export async function crearPublicacionAction(formData: FormData): Promise<ForoActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const contenido = String(formData.get("contenido") ?? "").trim();
  const carreraIdRaw = formData.get("carreraId");
  const carreraId = carreraIdRaw && carreraIdRaw !== "" ? String(carreraIdRaw) : null;

  if (!contenido) {
    return { error: "Escribí algo antes de publicar." };
  }
  if (contenido.length > 2000) {
    return { error: "El texto es demasiado largo (máximo 2000 caracteres)." };
  }

  // carreraId inválido para este autor lo rechaza la RLS
  // (foro_publicaciones_insert, migración 039) — acá solo se valida forma.
  const { error } = await supabase.from("foro_publicaciones").insert({
    autor_id: user.id,
    carrera_id: carreraId,
    contenido,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/comunidad");
  return { success: true };
}

export async function ocultarPublicacionAction(publicacionId: string, ocultar: boolean): Promise<ForoActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  // Solo Admin pasa la RLS de update (foro_publicaciones_admin_moderar) —
  // para cualquier otro rol esto actualiza 0 filas sin tirar error.
  const { error } = await supabase
    .from("foro_publicaciones")
    .update({
      oculto: ocultar,
      oculto_por: ocultar ? user.id : null,
      oculto_at: ocultar ? new Date().toISOString() : null,
    })
    .eq("id", publicacionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/comunidad");
  return { success: true };
}
