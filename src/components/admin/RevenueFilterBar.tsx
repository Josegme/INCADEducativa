"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { DISCOUNT_TYPE_LABEL } from "@/modules/admin/bookings";
import type { LocationRow } from "@/modules/admin/coworking";

const SELECT_CLASS =
  "h-9 rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 text-[13px] text-[--edu-text] focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

interface RevenueFilterBarProps {
  locations: LocationRow[];
  mes: string | undefined;
}

export function RevenueFilterBar({ locations, mes }: RevenueFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/admin/coworking/ingresos${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input type="month" value={mes ?? ""} onChange={(e) => setParam("mes", e.target.value)} className={SELECT_CLASS} />
      <button
        type="button"
        onClick={() => setParam("mes", "todos")}
        className="text-[12px] font-medium text-[--inc-violet-text] hover:underline"
      >
        Ver todos los períodos
      </button>

      <select
        value={searchParams.get("locationId") ?? ""}
        onChange={(e) => setParam("locationId", e.target.value)}
        className={SELECT_CLASS}
      >
        <option value="" className="bg-[--edu-surface-raised]">
          Todas las sedes
        </option>
        {locations.map((l) => (
          <option key={l.id} value={l.id} className="bg-[--edu-surface-raised]">
            {l.nombre}
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
