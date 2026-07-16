import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookingFilterBar } from "@/components/admin/BookingFilterBar";
import { BookingRowActions } from "@/components/admin/BookingRowActions";
import { ManualBookingModal } from "@/components/admin/ManualBookingModal";
import { CheckInScannerModal } from "@/components/admin/CheckInScannerModal";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUS_LABEL, type BookingStatus, type DiscountType } from "@/modules/coworking/booking";
import { DISCOUNT_TYPE_LABEL, type BookingAdminRow } from "@/modules/admin/bookings";
import type { LocationRow, SpaceRow } from "@/modules/admin/coworking";

const STATUS_BADGE_STATE: Record<BookingStatus, BadgeProps["state"]> = {
  pendiente: "pending",
  confirmada: "active",
  en_uso: "completed",
  completada: "completed",
  cancelada: "error",
  no_show: "locked",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

interface PageProps {
  searchParams: { estado?: string; fecha?: string; spaceId?: string; tipoDescuento?: string };
}

export default async function AdminCoworkingReservasPage({ searchParams }: PageProps) {
  const supabase = await createClient();

  const [{ data: locations }, { data: spaces }, { data: users }] = await Promise.all([
    supabase.from("locations").select("id, nombre, direccion, activa").order("nombre", { ascending: true }),
    supabase
      .from("spaces")
      .select("id, location_id, nombre, tipo, capacidad, precio_hora, descripcion, imagen_url, activo")
      .order("nombre", { ascending: true }),
    supabase.from("users").select("id, nombre, apellido, email").order("nombre", { ascending: true }).limit(500),
  ]);

  const locationRows = (locations ?? []) as LocationRow[];
  const spaceRows = (spaces ?? []) as SpaceRow[];
  const nameByLocation = new Map(locationRows.map((l) => [l.id, l.nombre]));
  const spaceById = new Map(spaceRows.map((s) => [s.id, s]));

  const fecha = searchParams.fecha === undefined ? todayIso() : searchParams.fecha === "todas" ? undefined : searchParams.fecha;

  let query = supabase
    .from("bookings")
    .select("id, space_id, user_id, fecha_inicio, fecha_fin, estado, monto, descuento_pct, tipo_descuento, notas")
    .order("fecha_inicio", { ascending: true });

  if (searchParams.estado) query = query.eq("estado", searchParams.estado);
  if (searchParams.spaceId) query = query.eq("space_id", searchParams.spaceId);
  if (searchParams.tipoDescuento) query = query.eq("tipo_descuento", searchParams.tipoDescuento);
  if (fecha) {
    const dayStart = new Date(`${fecha}T00:00:00`);
    const dayEnd = new Date(`${fecha}T23:59:59`);
    query = query.gte("fecha_inicio", dayStart.toISOString()).lte("fecha_inicio", dayEnd.toISOString());
  }

  const { data: bookings } = await query;

  const userIds = Array.from(new Set((bookings ?? []).map((b) => b.user_id)));
  const usersById = new Map((users ?? []).filter((u) => userIds.includes(u.id)).map((u) => [u.id, u]));
  // Fallback: si algún usuario de una reserva no vino en el listado (limit 500), lo buscamos aparte.
  const missingUserIds = userIds.filter((id) => !usersById.has(id));
  if (missingUserIds.length > 0) {
    const { data: missingUsers } = await supabase.from("users").select("id, nombre, apellido, email").in("id", missingUserIds);
    for (const u of missingUsers ?? []) usersById.set(u.id, u);
  }

  const rows: BookingAdminRow[] = (bookings ?? []).map((b) => {
    const space = spaceById.get(b.space_id);
    const user = usersById.get(b.user_id);
    return {
      ...b,
      tipo_descuento: b.tipo_descuento as DiscountType,
      espacioNombre: space?.nombre ?? "—",
      sedeNombre: space ? nameByLocation.get(space.location_id) ?? "—" : "—",
      usuarioNombre: user ? `${user.nombre} ${user.apellido}` : "—",
      usuarioEmail: user?.email ?? "—",
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Reservas de Coworking</h1>
          <p className="text-sm text-[--edu-text-muted]">
            {fecha ? `Reservas del ${fecha}` : "Todas las reservas"} — filtrá por estado, espacio o tipo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CheckInScannerModal />
          <ManualBookingModal locations={locationRows} spaces={spaceRows} users={users ?? []} />
        </div>
      </div>

      <BookingFilterBar spaces={spaceRows} fecha={fecha} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Espacio</TableHead>
            <TableHead>Sede</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Horario</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.espacioNombre}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{row.sedeNombre}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{row.usuarioNombre}</span>
                  <span className="text-[12px] text-[--edu-text-faint]">{row.usuarioEmail}</span>
                </div>
              </TableCell>
              <TableCell className="text-[--edu-text-muted]">
                {new Date(row.fecha_inicio).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </TableCell>
              <TableCell className="text-[--edu-text-muted]">${row.monto}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{DISCOUNT_TYPE_LABEL[row.tipo_descuento]}</TableCell>
              <TableCell>
                <Badge state={STATUS_BADGE_STATE[row.estado]}>{BOOKING_STATUS_LABEL[row.estado]}</Badge>
              </TableCell>
              <TableCell>
                <BookingRowActions bookingId={row.id} estado={row.estado} />
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-[--edu-text-muted]">
                No hay reservas para este filtro.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
