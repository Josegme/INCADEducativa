import { notFound, redirect } from "next/navigation";

import { MembershipSubscribeForm } from "@/components/coworking/MembershipSubscribeForm";
import { MEMBERSHIP_PLAN_TYPE_LABEL, type MembershipPlanType } from "@/modules/admin/membershipPlans";
import { createClient } from "@/lib/supabase/server";

export default async function MembresiaConfirmarPage({ params }: { params: { planId: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: plan } = await supabase
    .from("membership_plans")
    .select("id, tipo, nombre, precio, creditos_incluidos, activo")
    .eq("id", params.planId)
    .single();

  if (!plan || !plan.activo) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[24px] font-semibold text-white">Confirmar suscripción</h1>

      <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-5">
        <p className="text-[13px] text-[--edu-text-muted]">{MEMBERSHIP_PLAN_TYPE_LABEL[plan.tipo as MembershipPlanType]}</p>
        <p className="text-[18px] font-semibold text-white">{plan.nombre}</p>
        <p className="mt-2 text-sm text-[--edu-text]">
          {plan.creditos_incluidos} créditos incluidos por período.
        </p>
        <p className="mt-1 text-[20px] font-semibold text-white">${plan.precio}</p>
      </div>

      <MembershipSubscribeForm planId={plan.id} />
    </div>
  );
}
