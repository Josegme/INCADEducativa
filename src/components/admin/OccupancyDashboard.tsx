"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import { BOOKING_STATUS_LABEL, type BookingStatus } from "@/modules/coworking/booking";
import { runNoShowDetectionAction } from "@/app/(dashboard)/admin/actions/bookingAdminActions";

export interface SpaceStatus {
  id: string;
  nombre: string;
  sedeNombre: string;
  estado: "ocupado" | "disponible" | "bloqueado";
}

export interface TodayBookingRow {
  id: string;
  espacioNombre: string;
  usuarioNombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: BookingStatus;
  monto: number;
}

interface OccupancyDashboardProps {
  spaceStatuses: SpaceStatus[];
  todaysBookings: TodayBookingRow[];
  occupancy: { dia: number; semana: number; mes: number };
  noShowAlerts: number;
}

const SPACE_BADGE_STATE: Record<SpaceStatus["estado"], BadgeProps["state"]> = {
  ocupado: "error",
  disponible: "completed",
  bloqueado: "locked",
};

const SPACE_STATE_LABEL: Record<SpaceStatus["estado"], string> = {
  ocupado: "Ocupado",
  disponible: "Disponible",
  bloqueado: "Bloqueado",
};

const STATUS_BADGE_STATE: Record<BookingStatus, BadgeProps["state"]> = {
  pendiente: "pending",
  confirmada: "active",
  en_uso: "completed",
  completada: "completed",
  cancelada: "error",
  no_show: "locked",
};

export function OccupancyDashboard({ spaceStatuses, todaysBookings, occupancy, noShowAlerts }: OccupancyDashboardProps) {
  const router = useRouter();
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [detectResult, setDetectResult] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("bookings-admin-ocupacion")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => router.refresh())
      .subscribe();

    const interval = setInterval(() => router.refresh(), 20000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [router]);

  async function handleDetectNoShows() {
    setIsDetecting(true);
    setDetectResult(null);
    const result = await runNoShowDetectionAction();
    setIsDetecting(false);
    if (result.error) {
      setDetectResult(result.error);
      return;
    }
    setDetectResult(
      `${result.count ?? 0} reserva(s) marcadas como no-show, ${result.completedCount ?? 0} marcadas como completadas.`
    );
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Ocupación de Coworking</h1>
        <p className="text-sm text-[--edu-text-muted]">Mapa de espacios en tiempo real y reservas del día.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
          <p className="text-[12px] text-[--edu-text-muted]">Ocupación hoy</p>
          <p className="text-[24px] font-semibold text-white">{occupancy.dia}%</p>
        </div>
        <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
          <p className="text-[12px] text-[--edu-text-muted]">Últimos 7 días</p>
          <p className="text-[24px] font-semibold text-white">{occupancy.semana}%</p>
        </div>
        <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
          <p className="text-[12px] text-[--edu-text-muted]">Este mes</p>
          <p className="text-[24px] font-semibold text-white">{occupancy.mes}%</p>
        </div>
        <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
          <p className="text-[12px] text-[--edu-text-muted]">Alertas de no-show</p>
          <p className="text-[24px] font-semibold text-white">{noShowAlerts}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" disabled={isDetecting} onClick={handleDetectNoShows}>
          {isDetecting ? "Actualizando…" : "Actualizar estados ahora"}
        </Button>
        {detectResult ? <span className="text-[12px] text-[--edu-text-muted]">{detectResult}</span> : null}
      </div>

      <div>
        <h2 className="mb-2 text-[15px] font-semibold text-white">Mapa de espacios</h2>
        <div className="flex flex-wrap gap-2">
          {spaceStatuses.map((s) => (
            <div
              key={s.id}
              className="flex min-w-[160px] flex-col gap-1 rounded-md border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-3"
            >
              <span className="text-[13px] font-medium text-white">{s.nombre}</span>
              <span className="text-[12px] text-[--edu-text-muted]">{s.sedeNombre}</span>
              <Badge state={SPACE_BADGE_STATE[s.estado]}>{SPACE_STATE_LABEL[s.estado]}</Badge>
            </div>
          ))}
          {spaceStatuses.length === 0 ? (
            <NotificationBanner type="info">Todavía no hay espacios cargados.</NotificationBanner>
          ) : null}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-[15px] font-semibold text-white">Reservas de hoy</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Horario</TableHead>
              <TableHead>Espacio</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {todaysBookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="text-[--edu-text-muted]">
                  {new Date(b.fechaInicio).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}–
                  {new Date(b.fechaFin).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                </TableCell>
                <TableCell>{b.espacioNombre}</TableCell>
                <TableCell className="text-[--edu-text-muted]">{b.usuarioNombre}</TableCell>
                <TableCell className="text-[--edu-text-muted]">${b.monto}</TableCell>
                <TableCell>
                  <Badge state={STATUS_BADGE_STATE[b.estado]}>{BOOKING_STATUS_LABEL[b.estado]}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {todaysBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-[--edu-text-muted]">
                  No hay reservas para hoy.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
