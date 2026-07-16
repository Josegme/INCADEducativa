"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { BOOKING_STATUS_LABEL, type BookingStatus } from "@/modules/coworking/booking";
import { DISCOUNT_TYPE_LABEL } from "@/modules/admin/bookings";
import type { SpaceRow } from "@/modules/admin/coworking";

const SELECT_CLASS =
  "h-9 rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 text-[13px] text-[--edu-text] focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

const STATUSES: BookingStatus[] = ["pendiente", "confirmada", "en_uso", "completada", "cancelada", "no_show"];

interface BookingFilterBarProps {
  spaces: SpaceRow[];
  fecha: string | undefined;
}

export function BookingFilterBar({ spaces, fecha }: BookingFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/admin/coworking/reservas${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="date"
        value={fecha ?? ""}
        onChange={(e) => setParam("fecha", e.target.value)}
        className={SELECT_CLASS}
      />
      <button
        type="button"
        onClick={() => setParam("fecha", "todas")}
        className="text-[12px] font-medium text-[--inc-violet-text] hover:underline"
      >
        Ver todas las fechas
      </button>

      <select
        value={searchParams.get("estado") ?? ""}
        onChange={(e) => setParam("estado", e.target.value)}
        className={SELECT_CLASS}
      >
        <option value="" className="bg-[--edu-surface-raised]">
          Todos los estados
        </option>
        {STATUSES.map((s) => (
          <option key={s} value={s} className="bg-[--edu-surface-raised]">
            {BOOKING_STATUS_LABEL[s]}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("spaceId") ?? ""}
        onChange={(e) => setParam("spaceId", e.target.value)}
        className={SELECT_CLASS}
      >
        <option value="" className="bg-[--edu-surface-raised]">
          Todos los espacios
        </option>
        {spaces.map((s) => (
          <option key={s.id} value={s.id} className="bg-[--edu-surface-raised]">
            {s.nombre}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("tipoDescuento") ?? ""}
        onChange={(e) => setParam("tipoDescuento", e.target.value)}
        className={SELECT_CLASS}
      >
        <option value="" className="bg-[--edu-surface-raised]">
          Todos los tipos
        </option>
        {(Object.keys(DISCOUNT_TYPE_LABEL) as Array<keyof typeof DISCOUNT_TYPE_LABEL>).map((t) => (
          <option key={t} value={t} className="bg-[--edu-surface-raised]">
            {DISCOUNT_TYPE_LABEL[t]}
          </option>
        ))}
      </select>
    </div>
  );
}
