import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUS_LABEL, type BookingStatus } from "@/modules/coworking/booking";

const STATUS_BADGE_STATE: Record<BookingStatus, BadgeProps["state"]> = {
  pendiente: "pending",
  confirmada: "active",
  en_uso: "completed",
  completada: "completed",
  cancelada: "error",
  no_show: "locked",
};

export default async function MisReservasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, space_id, fecha_inicio, fecha_fin, estado, monto, tipo_descuento")
    .eq("user_id", user.id)
    .order("fecha_inicio", { ascending: false });

  const spaceIds = Array.from(new Set((bookings ?? []).map((b) => b.space_id)));
  const { data: spaces } =
    spaceIds.length > 0 ? await supabase.from("spaces").select("id, nombre").in("id", spaceIds) : { data: [] };
  const nameBySpace = new Map((spaces ?? []).map((s) => [s.id, s.nombre]));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[24px] font-semibold text-white">Mis reservas</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Espacio</TableHead>
            <TableHead>Horario</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(bookings ?? []).map((b) => (
            <TableRow key={b.id}>
              <TableCell>
                <Link href={`/servicios/coworking/reservas/${b.id}`} className="hover:underline">
                  {nameBySpace.get(b.space_id) ?? "—"}
                </Link>
              </TableCell>
              <TableCell className="text-[--edu-text-muted]">
                {new Date(b.fecha_inicio).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </TableCell>
              <TableCell className="text-[--edu-text-muted]">${b.monto}</TableCell>
              <TableCell>
                <Badge state={STATUS_BADGE_STATE[b.estado as BookingStatus]}>
                  {BOOKING_STATUS_LABEL[b.estado as BookingStatus]}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {(bookings ?? []).length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-[--edu-text-muted]">
                Todavía no hiciste ninguna reserva.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
