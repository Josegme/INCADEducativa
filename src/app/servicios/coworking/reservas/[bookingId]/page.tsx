import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUS_LABEL, type BookingStatus } from "@/modules/coworking/booking";

const STATUS_BADGE: Record<BookingStatus, "pending" | "completed" | "locked" | "error"> = {
  pendiente: "pending",
  confirmada: "completed",
  en_uso: "completed",
  completada: "completed",
  cancelada: "locked",
  no_show: "error",
};

export default async function BookingConfirmationPage({ params }: { params: { bookingId: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, space_id, fecha_inicio, fecha_fin, estado, monto, tipo_descuento")
    .eq("id", params.bookingId)
    .single();

  if (!booking) {
    notFound();
  }

  const [{ data: space }, { data: payment }] = await Promise.all([
    supabase.from("spaces").select("nombre, location_id").eq("id", booking.space_id).single(),
    supabase.from("payments").select("mp_preference_id, estado").eq("booking_id", booking.id).maybeSingle(),
  ]);

  const { data: location } = space
    ? await supabase.from("locations").select("nombre").eq("id", space.location_id).single()
    : { data: null };

  const estado = booking.estado as BookingStatus;
  const qrDataUrl = estado === "confirmada" ? await QRCode.toDataURL(booking.id, { margin: 1 }) : null;

  const fechaLabel = new Date(booking.fecha_inicio).toLocaleString("es-AR", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-white">Tu reserva</h1>
        <Badge state={STATUS_BADGE[estado]}>{BOOKING_STATUS_LABEL[estado]}</Badge>
      </div>

      <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-5">
        <p className="text-[15px] font-semibold text-white">{space?.nombre}</p>
        <p className="text-[13px] text-[--edu-text-muted]">{location?.nombre}</p>
        <p className="mt-2 text-sm text-[--edu-text]">{fechaLabel}</p>
        <p className="mt-1 text-sm text-[--edu-text-muted]">
          Monto: <span className="font-semibold text-white">${booking.monto}</span>
          {booking.tipo_descuento === "institucional" ? " (con descuento institucional)" : ""}
        </p>
      </div>

      {estado === "pendiente" && payment?.mp_preference_id ? (
        <NotificationBanner type="warning">
          Esperando la confirmación del pago. Esto puede tardar unos segundos tras completar el checkout de
          MercadoPago.
        </NotificationBanner>
      ) : null}

      {estado === "pendiente" && !payment?.mp_preference_id ? (
        <NotificationBanner type="info">
          Pago no disponible en este entorno de desarrollo (falta configurar MercadoPago). La reserva quedó
          registrada como pendiente.
        </NotificationBanner>
      ) : null}

      {estado === "confirmada" && qrDataUrl ? (
        <div className="flex flex-col items-center gap-2 rounded-[14px] border-[0.5px] border-[--edu-border] bg-white p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="Código QR de acceso a la reserva" className="h-40 w-40" />
          <p className="text-[12px] text-black/60">Mostrá este QR al ingresar</p>
        </div>
      ) : null}

      <Button asChild variant="outline">
        <Link href="/dashboard">Ir a mi panel</Link>
      </Button>
    </div>
  );
}
