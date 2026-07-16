"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { membershipPlanFormSchema } from "@/modules/admin/membershipPlans";

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
    throw new Error("Solo el administrador puede gestionar planes de membresía");
  }

  return { supabase };
}

export interface MembershipPlanFormState {
  error?: string;
  success?: boolean;
}

function parseMembershipPlanFormData(formData: FormData) {
  return membershipPlanFormSchema.safeParse({
    id: formData.get("id") || undefined,
    tipo: formData.get("tipo"),
    nombre: formData.get("nombre"),
    precio: formData.get("precio"),
    creditosIncluidos: formData.get("creditosIncluidos"),
    activo: formData.get("activo") === "true",
  });
}

export async function createMembershipPlanAction(formData: FormData): Promise<MembershipPlanFormState> {
  const { supabase } = await requireAdmin();

  const parsed = parseMembershipPlanFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { creditosIncluidos, ...rest } = parsed.data;

  const { error } = await supabase.from("membership_plans").insert({
    ...rest,
    creditos_incluidos: creditosIncluidos,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/coworking/membresias");
  return { success: true };
}

export async function updateMembershipPlanAction(formData: FormData): Promise<MembershipPlanFormState> {
  const { supabase } = await requireAdmin();

  const parsed = parseMembershipPlanFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, creditosIncluidos, ...rest } = parsed.data;
  if (!id) {
    return { error: "Falta el id del plan a editar" };
  }

  const { error } = await supabase
    .from("membership_plans")
    .update({ ...rest, creditos_incluidos: creditosIncluidos })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/coworking/membresias");
  return { success: true };
}

export async function toggleMembershipPlanActiveAction(
  planId: string,
  activo: boolean
): Promise<MembershipPlanFormState> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("membership_plans").update({ activo }).eq("id", planId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/coworking/membresias");
  return { success: true };
}
