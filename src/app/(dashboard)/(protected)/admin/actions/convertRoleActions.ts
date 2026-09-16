"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { logAudit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notifications";
import { convertRoleSchema, ROLE_LABEL } from "@/modules/admin/convertRole";

export interface ConvertRoleState {
  error?: string;
  success?: boolean;
}

export async function convertUserRoleAction(formData: FormData): Promise<ConvertRoleState> {
  const { supabase, adminId } = await requireAdmin();

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
    p_carrera_id: carreraId || undefined,
    p_dni: dni || undefined,
  });

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "usuario.convertir_rol",
    entidad: "users",
    entidadId: userId,
    detalle: { newRole, carreraId: carreraId || null },
  });

  const { data: targetUser } = await supabase.from("users").select("email").eq("id", userId).single();

  if (targetUser?.email) {
    await notifyUsers(supabase, {
      tipo: "sistema",
      titulo: `Tu cuenta ahora es ${ROLE_LABEL[newRole]}`,
      cuerpo: "Un administrador actualizó tu rol en la plataforma.",
      recipients: [{ userId, email: targetUser.email }],
      emailSubject: "Tu cuenta fue actualizada",
    });
  }

  revalidatePath("/admin/usuarios");
  return { success: true };
}

export interface SetCanTeachState {
  error?: string;
  success?: boolean;
}

export async function setCanTeachAction(userId: string, canTeach: boolean): Promise<SetCanTeachState> {
  const { supabase, adminId } = await requireAdmin();

  const { error } = await supabase.from("users").update({ can_teach: canTeach }).eq("id", userId);

  if (error) {
    return { error: "No se pudo actualizar el permiso" };
  }

  await logAudit({
    actorId: adminId,
    accion: canTeach ? "usuario.habilitar_docente" : "usuario.quitar_docente",
    entidad: "users",
    entidadId: userId,
  });

  revalidatePath("/admin/usuarios");
  return { success: true };
}
