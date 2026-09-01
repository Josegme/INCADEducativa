import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { createClient } from "@/lib/supabase/server";
import { COMPRA_ESTADO_LABEL, type CompraCursoEstado } from "@/modules/educativa/coursePurchase";

const STATUS_BADGE: Record<CompraCursoEstado, "pending" | "completed" | "locked" | "error"> = {
  pendiente: "pending",
  aprobado: "completed",
  rechazado: "error",
  reembolsado: "locked",
};

export default async function CoursePurchaseStatusPage({
  params,
}: {
  params: { slug: string; compraId: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: compra } = await supabase
    .from("compras_curso")
    .select("id, course_id, monto, descuento_pct, tipo_descuento, estado, mp_preference_id")
    .eq("id", params.compraId)
    .single();

  if (!compra) {
    notFound();
  }

  const { data: course } = await supabase.from("courses").select("titulo, slug").eq("id", compra.course_id).single();

  const estado = compra.estado as CompraCursoEstado;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-white">Tu compra</h1>
        <Badge state={STATUS_BADGE[estado]}>{COMPRA_ESTADO_LABEL[estado]}</Badge>
      </div>

      <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-5">
        <p className="text-[15px] font-semibold text-white">{course?.titulo}</p>
        <p className="mt-2 text-sm text-[--edu-text-muted]">
          Monto: <span className="font-semibold text-white">${compra.monto}</span>
          {compra.tipo_descuento === "institucional" ? " (con descuento institucional)" : ""}
          {compra.tipo_descuento === "cupon" ? " (con cupón)" : ""}
        </p>
      </div>

      {estado === "pendiente" && compra.mp_preference_id ? (
        <NotificationBanner type="warning">
          Esperando la confirmación del pago. Esto puede tardar unos segundos tras completar el checkout de
          MercadoPago.
        </NotificationBanner>
      ) : null}

      {estado === "pendiente" && !compra.mp_preference_id ? (
        <NotificationBanner type="info">
          Pago no disponible en este entorno de desarrollo (falta configurar MercadoPago). La compra quedó
          registrada como pendiente.
        </NotificationBanner>
      ) : null}

      {estado === "aprobado" && course?.slug ? (
        <Button asChild variant="primary">
          <Link href={`/cursos/${course.slug}`}>Ir al curso</Link>
        </Button>
      ) : null}

      <Button asChild variant="outline">
        <Link href="/dashboard">Ir a mi panel</Link>
      </Button>
    </div>
  );
}
