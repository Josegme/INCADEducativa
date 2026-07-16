"use server";

import { redirect } from "next/navigation";

import { createMembershipSubscription } from "@/lib/mercadopago/subscription";
import { createClient } from "@/lib/supabase/server";

export interface MembershipActionState {
  error?: string;
}

export async function createMembershipAction(formData: FormData): Promise<MembershipActionState> {
  const planId = formData.get("planId");
  if (typeof planId !== "string" || !planId) {
    return { error: "Falta el plan elegido" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "Necesitás iniciar sesión para suscribirte" };
  }

  const { data: plan } = await supabase
    .from("membership_plans")
    .select("id, nombre, precio, tipo, activo")
    .eq("id", planId)
    .single();

  if (!plan || !plan.activo) {
    return { error: "Ese plan ya no está disponible" };
  }

  const { data: membership, error: insertError } = await supabase
    .from("memberships")
    .insert({
      user_id: user.id,
      plan_id: plan.id,
      tipo: plan.tipo,
      activa: false,
      creditos_restantes: 0,
    })
    .select("id")
    .single();

  if (insertError || !membership) {
    return { error: insertError?.message ?? "No se pudo iniciar la membresía" };
  }

  const subscription = await createMembershipSubscription({
    membershipId: membership.id,
    payerEmail: user.email,
    monto: plan.precio,
    reason: `Membresía Coworking INCADE — ${plan.nombre}`,
  });

  if (!subscription) {
    // Sin MP_ACCESS_TOKEN configurada (dev sin credenciales) — la membresía
    // queda pendiente, mismo criterio de degradación que createBookingAction.
    redirect(`/servicios/coworking/membresia/estado/${membership.id}`);
  }

  await supabase.from("memberships").update({ mp_preapproval_id: subscription.preapprovalId }).eq("id", membership.id);

  redirect(subscription.initPoint);
}
