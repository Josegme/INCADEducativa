"use client";

import * as React from "react";

import { createBookingAction } from "@/app/servicios/coworking/actions/bookingActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { createClient } from "@/lib/supabase/client";
import {
  MAX_DURATION_HOURS,
  MIN_DURATION_HOURS,
  computeBookingAmount,
  hourSlots,
  nextBookingDays,
} from "@/modules/coworking/booking";
import { cn } from "@/lib/utils";

interface BookingFormProps {
  spaceId: string;
  precioHora: number;
  discountPct: number;
  isLoggedIn: boolean;
  coworkingCreditos: number;
}

const days = nextBookingDays();
const slots = hourSlots();

export function BookingForm({ spaceId, precioHora, discountPct, isLoggedIn, coworkingCreditos }: BookingFormProps) {
  const [fecha, setFecha] = React.useState(days[0].iso);
  const [horaInicio, setHoraInicio] = React.useState<number | null>(null);
  const [duracionHoras, setDuracionHoras] = React.useState(1);
  const [pagarConCredito, setPagarConCredito] = React.useState(false);
  const [occupied, setOccupied] = React.useState<Set<number>>(new Set());
  const [nombre, setNombre] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [telefonoContacto, setTelefonoContacto] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchOccupied = React.useCallback(async () => {
    const supabase = createClient();
    const dayStart = new Date(`${fecha}T00:00:00`);
    const dayEnd = new Date(`${fecha}T23:59:59`);

    // RPC security definer (013) — nunca se consulta `bookings` directo desde
    // acá: la RLS de esa tabla ("bookings_own") solo deja ver la reserva
    // propia, así que un usuario no vería los horarios que OTRO ya tomó.
    // La función devuelve únicamente fecha_inicio/fecha_fin, sin monto,
    // teléfono ni user_id de nadie.
    const { data } = await supabase.rpc("get_occupied_slots", {
      p_space_id: spaceId,
      p_from: dayStart.toISOString(),
      p_to: dayEnd.toISOString(),
    });

    const taken = new Set<number>();
    for (const slot of data ?? []) {
      const start = new Date(slot.fecha_inicio);
      const end = new Date(slot.fecha_fin);
      for (let h = start.getHours(); h < end.getHours(); h++) taken.add(h);
    }
    setOccupied(taken);
  }, [fecha, spaceId]);

  React.useEffect(() => {
    fetchOccupied();
  }, [fetchOccupied]);

  React.useEffect(() => {
    const supabase = createClient();
    // postgres_changes solo entrega el evento si la RLS de `bookings` deja
    // ver esa fila al usuario conectado — en la práctica esto refresca al
    // instante los cambios del propio usuario (ej. otra pestaña), pero no
    // los de otros usuarios (RLS los oculta a propósito, ver 013). El
    // polling de abajo cubre ese caso general sin exponer datos ajenos.
    const channel = supabase
      .channel(`bookings-space-${spaceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `space_id=eq.${spaceId}` },
        () => fetchOccupied()
      )
      .subscribe();

    const interval = setInterval(fetchOccupied, 20000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [spaceId, fetchOccupied]);

  React.useEffect(() => {
    setHoraInicio(null);
  }, [fecha]);

  const amount = computeBookingAmount(precioHora, duracionHoras, discountPct);
  const canPayWithCredit = coworkingCreditos >= duracionHoras;

  React.useEffect(() => {
    if (!canPayWithCredit) setPagarConCredito(false);
  }, [canPayWithCredit]);

  const rangeIsFree =
    horaInicio !== null &&
    Array.from({ length: duracionHoras }).every((_, i) => !occupied.has(horaInicio + i) && horaInicio + i < 22);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (horaInicio === null) {
      setError("Elegí un horario");
      return;
    }
    if (!rangeIsFree) {
      setError("Ese horario ya no está disponible — elegí otro");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("spaceId", spaceId);
    formData.set("fecha", fecha);
    formData.set("horaInicio", String(horaInicio));
    formData.set("duracionHoras", String(duracionHoras));
    if (pagarConCredito) formData.set("pagarConCredito", "true");
    if (telefonoContacto) formData.set("telefonoContacto", telefonoContacto);
    if (!isLoggedIn) {
      formData.set("nombre", nombre);
      formData.set("email", email);
      formData.set("password", password);
    }

    const result = await createBookingAction(formData);
    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error ? (
        <NotificationBanner type="danger" role="alert">
          {error}
        </NotificationBanner>
      ) : null}

      <div>
        <p className="mb-2 text-[13px] font-medium text-[--edu-text-muted]">Elegí el día</p>
        <div className="flex flex-wrap gap-2">
          {days.map((day) => (
            <button
              key={day.iso}
              type="button"
              onClick={() => setFecha(day.iso)}
              className={cn(
                "rounded-md border-[0.5px] px-3 py-1.5 text-[13px] font-medium capitalize transition-colors",
                day.iso === fecha
                  ? "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]"
                  : "border-[--edu-border] text-[--edu-text-muted] hover:bg-white/5"
              )}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium text-[--edu-text-muted]">Elegí el horario (1 hora por bloque)</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {slots.map((hour) => {
            const isOccupied = occupied.has(hour);
            const isSelected = horaInicio === hour;
            return (
              <button
                key={hour}
                type="button"
                disabled={isOccupied}
                onClick={() => setHoraInicio(hour)}
                className={cn(
                  "rounded-md border-[0.5px] px-2 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed",
                  isOccupied
                    ? "border-[--edu-danger-border] bg-[--edu-danger-subtle] text-[--edu-danger-text] opacity-60"
                    : isSelected
                      ? "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]"
                      : "border-[--edu-border] text-[--edu-text-muted] hover:bg-white/5"
                )}
              >
                {String(hour).padStart(2, "0")}:00
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="duracion" className="mb-1 block text-[13px] font-medium text-[--edu-text-muted]">
          Duración (horas)
        </label>
        <Input
          id="duracion"
          type="number"
          min={MIN_DURATION_HOURS}
          max={MAX_DURATION_HOURS}
          value={duracionHoras}
          onChange={(e) => setDuracionHoras(Number(e.target.value))}
          className="w-24"
        />
      </div>

      <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
        <p className="text-[13px] text-[--edu-text-muted]">Resumen</p>
        <div className="mt-1 flex items-baseline gap-2">
          {pagarConCredito ? (
            <>
              <span className="text-[14px] text-[--edu-text-faint] line-through">${amount.montoFinal}</span>
              <span className="text-[22px] font-semibold text-[--edu-success-text]">$0</span>
              <Badge state="completed">Pagás con {duracionHoras} crédito(s) canjeado(s)</Badge>
            </>
          ) : discountPct > 0 ? (
            <>
              <span className="text-[14px] text-[--edu-text-faint] line-through">${amount.montoOriginal}</span>
              <span className="text-[22px] font-semibold text-[--edu-success-text]">${amount.montoFinal}</span>
              <Badge state="completed">{discountPct}% descuento institucional</Badge>
            </>
          ) : (
            <span className="text-[22px] font-semibold text-white">${amount.montoFinal}</span>
          )}
        </div>

        {isLoggedIn && canPayWithCredit ? (
          <label className="mt-3 flex items-center gap-2 text-[13px] text-[--edu-text]">
            <input
              type="checkbox"
              checked={pagarConCredito}
              onChange={(e) => setPagarConCredito(e.target.checked)}
              className="h-4 w-4 rounded-sm border-[--edu-border] accent-[--inc-violet]"
            />
            Pagar con crédito canjeado (tenés {coworkingCreditos})
          </label>
        ) : null}
      </div>

      {!isLoggedIn ? (
        <fieldset className="flex flex-col gap-3 rounded-[14px] border-[0.5px] border-[--edu-border] p-4">
          <legend className="px-1 text-[13px] font-semibold text-white">Creá tu cuenta para reservar</legend>
          <Input
            placeholder="Nombre y apellido"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Contraseña (mínimo 8 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </fieldset>
      ) : null}

      <div>
        <label htmlFor="telefono" className="mb-1 block text-[13px] font-medium text-[--edu-text-muted]">
          WhatsApp para confirmación (opcional)
        </label>
        <Input
          id="telefono"
          placeholder="+54 9 376..."
          value={telefonoContacto}
          onChange={(e) => setTelefonoContacto(e.target.value)}
        />
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting || horaInicio === null}>
        {isSubmitting ? "Procesando…" : pagarConCredito ? "Reservar con crédito" : "Reservar y pagar"}
      </Button>
    </form>
  );
}
