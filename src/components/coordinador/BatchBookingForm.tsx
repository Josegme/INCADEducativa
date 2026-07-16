"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { hourSlots } from "@/modules/coworking/booking";
import { createBatchBookingAction } from "@/app/(dashboard)/coordinador/actions/batchBookingActions";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function BatchBookingForm({ spaceId }: { spaceId: string }) {
  const router = useRouter();
  const [fecha, setFecha] = React.useState(todayIso());
  const [horaInicio, setHoraInicio] = React.useState(8);
  const [duracionHoras, setDuracionHoras] = React.useState(1);
  const [semanas, setSemanas] = React.useState(4);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{ createdCount: number; failedWeeks?: string[] } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.set("spaceId", spaceId);
    formData.set("fecha", fecha);
    formData.set("horaInicio", String(horaInicio));
    formData.set("duracionHoras", String(duracionHoras));
    formData.set("semanas", String(semanas));

    const response = await createBatchBookingAction(formData);
    setIsLoading(false);

    if (response.error) {
      setError(response.error);
      return;
    }

    setResult({ createdCount: response.createdCount ?? 0, failedWeeks: response.failedWeeks });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error ? <NotificationBanner type="danger">{error}</NotificationBanner> : null}
      {result ? (
        <NotificationBanner type={result.failedWeeks ? "warning" : "success"}>
          Se crearon {result.createdCount} reserva(s).
          {result.failedWeeks ? ` No se pudo reservar: ${result.failedWeeks.join(", ")} (horario ya ocupado).` : ""}
        </NotificationBanner>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label htmlFor="fecha" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
            Primera fecha
          </label>
          <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="horaInicio" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
            Hora
          </label>
          <select
            id="horaInicio"
            value={horaInicio}
            onChange={(e) => setHoraInicio(Number(e.target.value))}
            className={SELECT_CLASS}
          >
            {hourSlots().map((h) => (
              <option key={h} value={h} className="bg-[--edu-surface-raised]">
                {String(h).padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="duracionHoras" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
            Duración (hs)
          </label>
          <Input
            id="duracionHoras"
            type="number"
            min={1}
            max={4}
            value={duracionHoras}
            onChange={(e) => setDuracionHoras(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label htmlFor="semanas" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
            Semanas seguidas
          </label>
          <Input
            id="semanas"
            type="number"
            min={2}
            max={12}
            value={semanas}
            onChange={(e) => setSemanas(Number(e.target.value))}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-fit">
        {isLoading ? "Reservando…" : `Reservar ${semanas} semanas`}
      </Button>
    </form>
  );
}
