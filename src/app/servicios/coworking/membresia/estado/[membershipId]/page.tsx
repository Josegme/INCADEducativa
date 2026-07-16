import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { MEMBERSHIP_PLAN_TYPE_LABEL, type MembershipPlanType } from "@/modules/admin/membershipPlans";
import { createClient } from "@/lib/supabase/server";

export default async function MembresiaEstadoPage({ params }: { params: { membershipId: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("id, activa, inicio, fin, creditos_restantes, plan_id, mp_preapproval_id")
    .eq("id", params.membershipId)
    .single();

  if (!membership) {
    notFound();
  }

  const { data: plan } = membership.plan_id
    ? await supabase
        .from("membership_plans")
        .select("nombre, tipo, precio")
        .eq("id", membership.plan_id)
        .single()
    : { data: null };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-white">Tu membresía</h1>
        <Badge state={membership.activa ? "completed" : "pending"}>{membership.activa ? "Activa" : "Pendiente"}</Badge>
      </div>

      <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-5">
        <p className="text-[13px] text-[--edu-text-muted]">
          {plan ? MEMBERSHIP_PLAN_TYPE_LABEL[plan.tipo as MembershipPlanType] : "—"}
        </p>
        <p className="text-[15px] font-semibold text-white">{plan?.nombre}</p>
        {membership.activa ? (
          <>
            <p className="mt-2 text-sm text-[--edu-text]">
              Créditos restantes: <span className="font-semibold text-white">{membership.creditos_restantes}</span>
            </p>
            <p className="text-sm text-[--edu-text-muted]">
              Vence el {membership.fin ? new Date(membership.fin).toLocaleDateString("es-AR") : "—"}
            </p>
          </>
        ) : null}
      </div>

      {!membership.activa && !membership.mp_preapproval_id ? (
        <NotificationBanner type="info">
          Pago no disponible en este entorno de desarrollo (falta configurar MercadoPago). La membresía quedó
          registrada como pendiente.
        </NotificationBanner>
      ) : null}

      {!membership.activa && membership.mp_preapproval_id ? (
        <NotificationBanner type="warning">
          Esperando la confirmación de la suscripción. Esto puede tardar unos segundos tras completar la
          autorización en MercadoPago.
        </NotificationBanner>
      ) : null}

      <Button asChild variant="outline">
        <Link href="/dashboard">Ir a mi panel</Link>
      </Button>
    </div>
  );
}
