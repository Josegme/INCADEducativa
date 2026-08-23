"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface ProfileActionState {
  error?: string;
  success?: boolean;
}

/** Guarda el path del avatar recién subido (el upload en sí lo hace el
 * cliente directo a Storage — acá solo se persiste la referencia). */
export async function updateAvatarAction(path: string): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase.from("users").update({ avatar_url: path }).eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/perfil");
  return { success: true };
}
