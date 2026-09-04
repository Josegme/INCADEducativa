import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { createClient } from "@/lib/supabase/server";

export default async function CatalogSuscripcionEstadoPage({
  params,
}: {
  params: { suscripcionId: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: suscripcion } = await supabase
    .from("catalogo_suscripciones")
    .select("id, activa, inicio, fin, plan_id, mp_preapproval_id, monto, tipo_descuento")
    .eq("id", params.suscripcionId)
    .single();

  if (!suscripcion) {
    notFound();
  }

  const { data: plan } = suscripcion.plan_id
    ? await supabase.from("catalogo_planes").select("nombre").eq("id", suscripcion.plan_id).single()
    : { data: null };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-white">Tu suscripción</h1>
        <Badge state={suscripcion.activa ? "completed" : "pending"}>
          {suscripcion.activa ? "Activa" : "Pendiente"}
        </Badge>
      </div>

      <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-5">
        <p className="text-[15px] font-semibold text-white">{plan?.nombre}</p>
        <p className="mt-2 text-sm text-[--edu-text-muted]">
          Monto: <span className="font-semibold text-white">${suscripcion.monto}</span>
          {suscripcion.tipo_descuento === "institucional" ? " (con descuento institucional)" : ""}
        </p>
        {suscripcion.activa ? (
          <p className="mt-1 text-sm text-[--edu-text-muted]">
            Vence el {suscripcion.fin ? new Date(suscripcion.fin).toLocaleDateString("es-AR") : "—"}
          </p>
        ) : null}
      </div>

      {!suscripcion.activa && !suscripcion.mp_preapproval_id ? (
        <NotificationBanner type="info">
          Pago no disponible en este entorno de desarrollo (falta configurar MercadoPago). La suscripción quedó
          registrada como pendiente.
        </NotificationBanner>
      ) : null}

      {!suscripcion.activa && suscripcion.mp_preapproval_id ? (
        <NotificationBanner type="warning">
          Esperando la confirmación de la suscripción. Esto puede tardar unos segundos tras completar la
          autorización en MercadoPago.
        </NotificationBanner>
      ) : null}

      {suscripcion.activa ? (
        <Button asChild variant="primary">
          <Link href="/cursos">Ver catálogo</Link>
        </Button>
      ) : null}

      <Button asChild variant="outline">
        <Link href="/dashboard">Ir a mi panel</Link>
      </Button>
    </div>
  );
}
