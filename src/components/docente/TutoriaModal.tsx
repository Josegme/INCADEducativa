"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { createClient } from "@/lib/supabase/client";
import { hourSlots, nextBookingDays } from "@/modules/coworking/booking";
import type { TutoriaModalidad } from "@/modules/tutorias/tutorias";
import { createTutoriaAction } from "@/app/(dashboard)/docente/actions/tutoriaActions";
import { cn } from "@/lib/utils";

interface Aula {
  id: string;
  nombre: string;
}

interface TutoriaModalProps {
  cursoId: string;
  aulas: Aula[];
  coworkingHabilitado: boolean;
}

const days = nextBookingDays();
const slots = hourSlots();

export function TutoriaModal({ cursoId, aulas, coworkingHabilitado }: TutoriaModalProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [modalidad, setModalidad] = React.useState<TutoriaModalidad>("virtual");
  const [linkVirtual, setLinkVirtual] = React.useState("");
  const [spaceId, setSpaceId] = React.useState(aulas[0]?.id ?? "");
  const [fecha, setFecha] = React.useState(days[0].iso);
  const [horaInicio, setHoraInicio] = React.useState<number | null>(null);
  const [duracionHoras, setDuracionHoras] = React.useState(1);
  const [occupied, setOccupied] = React.useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (modalidad !== "presencial" || !spaceId) return;

    let cancelled = false;
    async function fetchOccupied() {
      const supabase = createClient();
      const dayStart = new Date(`${fecha}T00:00:00`);
      const dayEnd = new Date(`${fecha}T23:59:59`);
      const { data } = await supabase.rpc("get_occupied_slots", {
        p_space_id: spaceId,
        p_from: dayStart.toISOString(),
        p_to: dayEnd.toISOString(),
      });
      if (cancelled) return;
      const taken = new Set<number>();
      for (const slot of data ?? []) {
        const start = new Date(slot.fecha_inicio);
        const end = new Date(slot.fecha_fin);
        for (let h = start.getHours(); h < end.getHours(); h++) taken.add(h);
      }
      setOccupied(taken);
    }
    fetchOccupied();
    return () => {
      cancelled = true;
    };
  }, [modalidad, spaceId, fecha]);

  React.useEffect(() => {
    setHoraInicio(null);
  }, [fecha, modalidad]);

  const rangeIsFree =
    horaInicio === null ||
    modalidad === "virtual" ||
    Array.from({ length: duracionHoras }).every((_, i) => !occupied.has(horaInicio + i));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (horaInicio === null) {
      setError("Elegí un horario");
      return;
    }
    if (modalidad === "presencial" && !rangeIsFree) {
      setError("Ese horario ya no está disponible — elegí otro");
      return;
    }
    if (modalidad === "virtual" && !linkVirtual.trim()) {
      setError("Pegá el link de la tutoría");
      return;
    }
    if (modalidad === "presencial" && !spaceId) {
      setError("Elegí un aula");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await createTutoriaAction({
      cursoId,
      modalidad,
      fecha,
      horaInicio,
      duracionHoras,
      linkVirtual,
      spaceId: modalidad === "presencial" ? spaceId : "",
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    setLinkVirtual("");
    setHoraInicio(null);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          + Tutoría
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva tutoría</DialogTitle>
          <DialogDescription>Se notifica automáticamente a los alumnos inscriptos.</DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-[13px] font-medium text-[--edu-text-muted]">Modalidad</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalidad("virtual")}
                className={cn(
                  "rounded-md border-[0.5px] px-3 py-1.5 text-[13px] font-medium transition-colors",
                  modalidad === "virtual"
                    ? "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]"
                    : "border-[--edu-border] text-[--edu-text-muted] hover:bg-white/5"
                )}
              >
                Virtual
              </button>
              <button
                type="button"
                disabled={!coworkingHabilitado || aulas.length === 0}
                onClick={() => setModalidad("presencial")}
                className={cn(
                  "rounded-md border-[0.5px] px-3 py-1.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                  modalidad === "presencial"
                    ? "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]"
                    : "border-[--edu-border] text-[--edu-text-muted] hover:bg-white/5"
                )}
              >
                Presencial
              </button>
            </div>
            {!coworkingHabilitado || aulas.length === 0 ? (
              <p className="mt-1 text-[12px] text-[--edu-text-faint]">
                No hay aulas disponibles — solo se puede programar virtual.
              </p>
            ) : null}
          </div>

          {modalidad === "virtual" ? (
            <div>
              <label htmlFor="linkVirtual" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Link (Meet/Zoom)
              </label>
              <Input
                id="linkVirtual"
                type="url"
                value={linkVirtual}
                onChange={(e) => setLinkVirtual(e.target.value)}
                placeholder="https://meet.google.com/..."
                required
              />
            </div>
          ) : (
            <div>
              <label htmlFor="aula" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Aula
              </label>
              <select
                id="aula"
                value={spaceId}
                onChange={(e) => setSpaceId(e.target.value)}
                className="flex h-9 w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 text-sm text-[--edu-text]"
              >
                {aulas.map((aula) => (
                  <option key={aula.id} value={aula.id}>
                    {aula.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            <p className="mb-2 text-[13px] font-medium text-[--edu-text-muted]">Elegí el horario</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {slots.map((hour) => {
                const isOccupied = modalidad === "presencial" && occupied.has(hour);
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
              min={1}
              max={4}
              value={duracionHoras}
              onChange={(e) => setDuracionHoras(Number(e.target.value))}
              className="w-24"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || horaInicio === null}>
              {isSubmitting ? "Programando…" : "Programar tutoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
