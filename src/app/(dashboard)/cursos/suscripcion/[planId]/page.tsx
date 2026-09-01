import { notFound } from "next/navigation";

import { SubscribeForm } from "@/components/educativa/SubscribeForm";
import { getFlags } from "@/lib/flags";
import { createClient } from "@/lib/supabase/server";

export default async function CatalogSuscripcionConfirmarPage({ params }: { params: { planId: string } }) {
  const supabase = await createClient();
  const flags = await getFlags();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plan } = await supabase
    .from("catalogo_planes")
    .select("id, nombre, precio, activo")
    .eq("id", params.planId)
    .single();

  if (!plan || !plan.activo) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[24px] font-semibold text-white">Confirmar suscripción</h1>

      <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-5">
        <p className="text-[13px] text-[--edu-text-muted]">Mensual</p>
        <p className="text-[18px] font-semibold text-white">{plan.nombre}</p>
        <p className="mt-1 text-[20px] font-semibold text-white">${plan.precio} /mes</p>
      </div>

      <SubscribeForm planId={plan.id} isAnonymous={!user} showGuestFields={!user && flags.publica} />
    </div>
  );
}
