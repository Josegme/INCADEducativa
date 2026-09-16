"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { logAudit } from "@/lib/audit";
import { userEditFormSchema } from "@/modules/admin/users";

export interface UserEditState {
  error?: string;
  success?: boolean;
}

export async function updateUserAction(formData: FormData): Promise<UserEditState> {
  const { supabase, adminId } = await requireAdmin();

  const parsed = userEditFormSchema.safeParse({
    id: formData.get("id"),
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    dni: formData.get("dni") ?? "",
    carreraId: formData.get("carreraId") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, nombre, apellido, dni, carreraId } = parsed.data;

  const { error } = await supabase
    .from("users")
    .update({
      nombre,
      apellido,
      dni: dni || null,
      carrera_id: carreraId || null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.code === "23505" ? "Ese DNI ya está en uso por otro usuario" : error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "usuario.editar",
    entidad: "users",
    entidadId: id,
    detalle: { nombre, apellido, dni: dni || null, carreraId: carreraId || null },
  });

  revalidatePath("/admin/usuarios");
  return { success: true };
}

export interface SetUserActivoState {
  error?: string;
  success?: boolean;
}

export async function setUserActivoAction(userId: string, activo: boolean): Promise<SetUserActivoState> {
  const { supabase, adminId } = await requireAdmin();

  const { error } = await supabase.from("users").update({ activo }).eq("id", userId);

  if (error) {
    return { error: "No se pudo actualizar el estado del usuario" };
  }

  await logAudit({
    actorId: adminId,
    accion: activo ? "usuario.activar" : "usuario.desactivar",
    entidad: "users",
    entidadId: userId,
  });

  revalidatePath("/admin/usuarios");
  return { success: true };
}
