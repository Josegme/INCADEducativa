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
import { hourSlots } from "@/modules/coworking/booking";
import type { LocationRow, SpaceRow } from "@/modules/admin/coworking";
import type { UserOption } from "@/modules/admin/bookings";
import { createManualBookingAction } from "@/app/(dashboard)/admin/actions/bookingAdminActions";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

interface ManualBookingModalProps {
  locations: LocationRow[];
  spaces: SpaceRow[];
  users: UserOption[];
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function ManualBookingModal({ locations, spaces, users }: ManualBookingModalProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [userQuery, setUserQuery] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState<UserOption | null>(null);
  const activeSpaces = React.useMemo(() => spaces.filter((s) => s.activo), [spaces]);
  const nameByLocation = React.useMemo(() => new Map(locations.map((l) => [l.id, l.nombre])), [locations]);
  const [spaceId, setSpaceId] = React.useState(activeSpaces[0]?.id ?? "");
  const [fecha, setFecha] = React.useState(todayIso());
  const [horaInicio, setHoraInicio] = React.useState(8);
  const [duracionHoras, setDuracionHoras] = React.useState(1);
  const [notas, setNotas] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const filteredUsers = React.useMemo(() => {
    if (!userQuery.trim()) return [];
    const q = userQuery.trim().toLowerCase();
    return users
      .filter((u) => `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [users, userQuery]);

  function reset() {
    setUserQuery("");
    setSelectedUser(null);
    setSpaceId(activeSpaces[0]?.id ?? "");
    setFecha(todayIso());
    setHoraInicio(8);
    setDuracionHoras(1);
    setNotas("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) {
      setError("Elegí un usuario para la reserva");
      return;
    }
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("userId", selectedUser.id);
    formData.set("spaceId", spaceId);
    formData.set("fecha", fecha);
    formData.set("horaInicio", String(horaInicio));
    formData.set("duracionHoras", String(duracionHoras));
    formData.set("notas", notas);

    const result = await createManualBookingAction(formData);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Reserva manual
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reserva manual</DialogTitle>
          <DialogDescription>Sin pago online — para acuerdos directos (tipo_descuento = manual).</DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">Usuario</label>
            {selectedUser ? (
              <div className="flex items-center justify-between rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm">
                <span>
                  {selectedUser.nombre} {selectedUser.apellido} — {selectedUser.email}
                </span>
                <button
                  type="button"
                  className="text-[12px] font-medium text-[--inc-violet-text] hover:underline"
                  onClick={() => setSelectedUser(null)}
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <>
                <Input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Buscar por nombre o email…"
                />
                {filteredUsers.length > 0 ? (
                  <div className="mt-1 flex flex-col gap-1 rounded-md border-[0.5px] border-[--edu-border] bg-[--edu-surface-raised] p-1">
                    {filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        className="rounded-sm px-2 py-1.5 text-left text-[13px] hover:bg-white/5"
                        onClick={() => {
                          setSelectedUser(u);
                          setUserQuery("");
                        }}
                      >
                        {u.nombre} {u.apellido} — <span className="text-[--edu-text-muted]">{u.email}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div>
            <label htmlFor="spaceId" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Espacio
            </label>
            <select id="spaceId" value={spaceId} onChange={(e) => setSpaceId(e.target.value)} className={SELECT_CLASS} required>
              {activeSpaces.map((s) => (
                <option key={s.id} value={s.id} className="bg-[--edu-surface-raised]">
                  {nameByLocation.get(s.location_id) ?? "—"} — {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="fecha" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Fecha
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
                max={12}
                value={duracionHoras}
                onChange={(e) => setDuracionHoras(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="notas" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Notas (opcional)
            </label>
            <Input id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Acuerdo institucional…" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Guardando…" : "Crear reserva"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
