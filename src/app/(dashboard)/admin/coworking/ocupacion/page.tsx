import { OccupancyDashboard, type SpaceStatus, type TodayBookingRow } from "@/components/admin/OccupancyDashboard";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_OPEN_HOUR, BOOKING_CLOSE_HOUR } from "@/modules/coworking/booking";
import type { LocationRow, SpaceRow } from "@/modules/admin/coworking";

const BUSINESS_HOURS = BOOKING_CLOSE_HOUR - BOOKING_OPEN_HOUR;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function durationHours(fechaInicio: string, fechaFin: string) {
  return (new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 60 * 60);
}

export default async function AdminCoworkingOcupacionPage() {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const todayStart = startOfDay(now);
  const since = monthStart < weekStart ? monthStart : weekStart;

  const [{ data: locations }, { data: spaces }, { data: bookings }] = await Promise.all([
    supabase.from("locations").select("id, nombre, direccion, activa").order("nombre", { ascending: true }),
    supabase
      .from("spaces")
      .select("id, location_id, nombre, tipo, capacidad, precio_hora, descripcion, imagen_url, activo")
      .order("nombre", { ascending: true }),
    supabase
      .from("bookings")
      .select("id, space_id, user_id, fecha_inicio, fecha_fin, estado, monto")
      .in("estado", ["confirmada", "en_uso", "completada"])
      .gte("fecha_inicio", since.toISOString())
      .order("fecha_inicio", { ascending: true }),
  ]);

  const locationRows = (locations ?? []) as LocationRow[];
  const spaceRows = (spaces ?? []) as SpaceRow[];
  const bookingRows = bookings ?? [];
  const nameByLocation = new Map(locationRows.map((l) => [l.id, l.nombre]));

  const userIds = Array.from(new Set(bookingRows.map((b) => b.user_id)));
  const { data: users } =
    userIds.length > 0
      ? await supabase.from("users").select("id, nombre, apellido").in("id", userIds)
      : { data: [] };
  const nameByUser = new Map((users ?? []).map((u) => [u.id, `${u.nombre} ${u.apellido}`]));

  const nowMs = now.getTime();

  const spaceStatuses: SpaceStatus[] = spaceRows.map((space) => {
    const activeNow = bookingRows.some(
      (b) =>
        b.space_id === space.id &&
        (b.estado === "confirmada" || b.estado === "en_uso") &&
        new Date(b.fecha_inicio).getTime() <= nowMs &&
        new Date(b.fecha_fin).getTime() >= nowMs
    );
    const estado: SpaceStatus["estado"] = activeNow ? "ocupado" : !space.activo ? "bloqueado" : "disponible";
    return {
      id: space.id,
      nombre: space.nombre,
      sedeNombre: nameByLocation.get(space.location_id) ?? "—",
      estado,
    };
  });

  const todaysBookings: TodayBookingRow[] = bookingRows
    .filter((b) => new Date(b.fecha_inicio) >= todayStart && new Date(b.fecha_inicio) < new Date(todayStart.getTime() + 86400000))
    .map((b) => {
      const space = spaceRows.find((s) => s.id === b.space_id);
      return {
        id: b.id,
        espacioNombre: space?.nombre ?? "—",
        usuarioNombre: nameByUser.get(b.user_id) ?? "—",
        fechaInicio: b.fecha_inicio,
        fechaFin: b.fecha_fin,
        estado: b.estado,
        monto: b.monto,
      };
    });

  const activeSpacesCount = spaceRows.filter((s) => s.activo).length || 1;

  function occupancyRate(from: Date, days: number) {
    const fromMs = from.getTime();
    const toMs = fromMs + days * 86400000;
    const bookedHours = bookingRows
      .filter((b) => {
        const t = new Date(b.fecha_inicio).getTime();
        return t >= fromMs && t < toMs;
      })
      .reduce((sum, b) => sum + durationHours(b.fecha_inicio, b.fecha_fin), 0);
    const availableHours = activeSpacesCount * BUSINESS_HOURS * days;
    return Math.min(100, Math.round((bookedHours / availableHours) * 100));
  }

  const occupancy = {
    dia: occupancyRate(todayStart, 1),
    semana: occupancyRate(weekStart, 7),
    mes: occupancyRate(monthStart, Math.max(1, Math.ceil((nowMs - monthStart.getTime()) / 86400000))),
  };

  const noShowAlerts = bookingRows.filter((b) => b.estado === "confirmada" && new Date(b.fecha_inicio).getTime() < nowMs - 15 * 60 * 1000).length;

  const countBySpace = new Map<string, number>();
  for (const b of bookingRows) {
    countBySpace.set(b.space_id, (countBySpace.get(b.space_id) ?? 0) + 1);
  }
  const topSpaces = Array.from(countBySpace.entries())
    .map(([spaceId, count]) => ({ label: spaceRows.find((s) => s.id === spaceId)?.nombre ?? "—", value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const countByHour = new Map<number, number>();
  for (const b of bookingRows) {
    const hour = new Date(b.fecha_inicio).getHours();
    countByHour.set(hour, (countByHour.get(hour) ?? 0) + 1);
  }
  const peakHours = Array.from({ length: BOOKING_CLOSE_HOUR - BOOKING_OPEN_HOUR }, (_, i) => BOOKING_OPEN_HOUR + i)
    .map((hour) => ({ label: `${String(hour).padStart(2, "0")}:00`, value: countByHour.get(hour) ?? 0 }))
    .filter((row) => row.value > 0);

  return (
    <OccupancyDashboard
      spaceStatuses={spaceStatuses}
      todaysBookings={todaysBookings}
      occupancy={occupancy}
      noShowAlerts={noShowAlerts}
      topSpaces={topSpaces}
      peakHours={peakHours}
    />
  );
}
