"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { couponFormSchema } from "@/modules/admin/coworking";

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
    throw new Error("Solo el administrador puede gestionar cupones");
  }

  return { supabase, adminId: user.id };
}

export interface CouponActionState {
  error?: string;
  success?: boolean;
}

function parseCouponFormData(formData: FormData) {
  return couponFormSchema.safeParse({
    id: formData.get("id") || undefined,
    codigo: formData.get("codigo"),
    descuentoPct: formData.get("descuentoPct"),
    validoDesde: formData.get("validoDesde"),
    validoHasta: formData.get("validoHasta"),
    usosMaximos: formData.get("usosMaximos") || undefined,
    activo: formData.get("activo") === "true",
  });
}

export async function createCouponAction(formData: FormData): Promise<CouponActionState> {
  const { supabase, adminId } = await requireAdmin();

  const parsed = parseCouponFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { codigo, descuentoPct, validoDesde, validoHasta, usosMaximos, activo } = parsed.data;

  const { data: created, error } = await supabase
    .from("coupons")
    .insert({
      codigo,
      descuento_pct: descuentoPct,
      valido_desde: validoDesde,
      valido_hasta: validoHasta,
      usos_maximos: usosMaximos ?? null,
      activo,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.code === "23505" ? "Ya existe un cupón con ese código" : error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "coworking.cupon.crear",
    entidad: "coupons",
    entidadId: created?.id ?? null,
    detalle: { codigo },
  });

  revalidatePath("/admin/coworking/cupones");
  return { success: true };
}

export async function updateCouponAction(formData: FormData): Promise<CouponActionState> {
  const { supabase, adminId } = await requireAdmin();

  const parsed = parseCouponFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, codigo, descuentoPct, validoDesde, validoHasta, usosMaximos, activo } = parsed.data;
  if (!id) {
    return { error: "Falta el id del cupón a editar" };
  }

  const { error } = await supabase
    .from("coupons")
    .update({
      codigo,
      descuento_pct: descuentoPct,
      valido_desde: validoDesde,
      valido_hasta: validoHasta,
      usos_maximos: usosMaximos ?? null,
      activo,
    })
    .eq("id", id);

  if (error) {
    return { error: error.code === "23505" ? "Ya existe un cupón con ese código" : error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: "coworking.cupon.editar",
    entidad: "coupons",
    entidadId: id,
    detalle: { codigo },
  });

  revalidatePath("/admin/coworking/cupones");
  return { success: true };
}

export async function toggleCouponActiveAction(couponId: string, activo: boolean): Promise<CouponActionState> {
  const { supabase, adminId } = await requireAdmin();

  const { error } = await supabase.from("coupons").update({ activo }).eq("id", couponId);

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: adminId,
    accion: activo ? "coworking.cupon.activar" : "coworking.cupon.desactivar",
    entidad: "coupons",
    entidadId: couponId,
  });

  revalidatePath("/admin/coworking/cupones");
  return { success: true };
}
