"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { BookingStatus } from "@/modules/coworking/booking";
import { cancelBookingAction, checkInBookingAction } from "@/app/(dashboard)/admin/actions/bookingAdminActions";

interface BookingRowActionsProps {
  bookingId: string;
  estado: BookingStatus;
}

export function BookingRowActions({ bookingId, estado }: BookingRowActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<"presente" | "cancelar" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handlePresente() {
    setIsLoading("presente");
    setError(null);
    const result = await checkInBookingAction(bookingId, "manual");
    setIsLoading(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleCancelar() {
    if (!window.confirm("¿Cancelar esta reserva? Se le va a notificar al usuario.")) return;
    setIsLoading("cancelar");
    setError(null);
    const result = await cancelBookingAction(bookingId);
    setIsLoading(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {estado === "confirmada" ? (
          <Button variant="outline" size="sm" disabled={isLoading !== null} onClick={handlePresente}>
            {isLoading === "presente" ? "…" : "Presente"}
          </Button>
        ) : null}
        {estado !== "cancelada" && estado !== "completada" ? (
          <Button variant="destructive" size="sm" disabled={isLoading !== null} onClick={handleCancelar}>
            {isLoading === "cancelar" ? "…" : "Cancelar"}
          </Button>
        ) : null}
      </div>
      {error ? <span className="text-[12px] text-[--edu-danger-text]">{error}</span> : null}
    </div>
  );
}
