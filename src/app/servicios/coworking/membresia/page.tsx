import { redirect } from "next/navigation";

import { MembershipPlanCard } from "@/components/coworking/MembershipPlanCard";
import { createClient } from "@/lib/supabase/server";
import type { MembershipPlanPublic } from "@/modules/coworking/membership";

export default async function CoworkingMembresiaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: plans } = await supabase
    .from("membership_plans")
    .select("id, tipo, nombre, precio, creditos_incluidos")
    .eq("activo", true)
    .order("precio", { ascending: true });

  const planRows = (plans ?? []) as MembershipPlanPublic[];

  const { data: membership } = await supabase
    .from("memberships")
    .select("id, activa, fin, creditos_restantes")
    .eq("user_id", user.id)
    .eq("activa", true)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-[24px] font-semibold text-white">Membresías de Coworking</h1>
        <p className="text-sm text-[--edu-text-muted]">
          Suscribite a un plan mensual o anual y sumá créditos para usar el Coworking.
        </p>
      </div>

      {membership ? (
        <div className="rounded-[14px] border-[0.5px] border-[--edu-success-border] bg-[--edu-success-subtle] p-4 text-sm text-[--edu-success-text]">
          Ya tenés una membresía activa — {membership.creditos_restantes} créditos restantes, vence el{" "}
          {membership.fin ? new Date(membership.fin).toLocaleDateString("es-AR") : "—"}.
        </div>
      ) : null}

      {planRows.length === 0 ? (
        <p className="text-sm text-[--edu-text-muted]">Todavía no hay planes de membresía publicados.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {planRows.map((plan) => (
            <MembershipPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
