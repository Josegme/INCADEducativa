"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { convertRoleSchema } from "@/modules/admin/convertRole";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    throw new Error("Solo el administrador puede convertir roles");
  }

  return { supabase };
}

export interface ConvertRoleState {
  error?: string;
  success?: boolean;
}

export async function convertUserRoleAction(formData: FormData): Promise<ConvertRoleState> {
  const { supabase } = await requireAdmin();

  const parsed = convertRoleSchema.safeParse({
    userId: formData.get("userId"),
    newRole: formData.get("newRole"),
    carreraId: formData.get("carreraId") ?? "",
    dni: formData.get("dni") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { userId, newRole, carreraId, dni } = parsed.data;

  const { error } = await supabase.rpc("convert_user_role", {
    p_user_id: userId,
    p_new_role: newRole,
    p_carrera_id: carreraId || null,
    p_dni: dni || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/usuarios");
  return { success: true };
}

export interface SetCanTeachState {
  error?: string;
  success?: boolean;
}

export async function setCanTeachAction(userId: string, canTeach: boolean): Promise<SetCanTeachState> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("users").update({ can_teach: canTeach }).eq("id", userId);

  if (error) {
    return { error: "No se pudo actualizar el permiso" };
  }

  revalidatePath("/admin/usuarios");
  return { success: true };
}
