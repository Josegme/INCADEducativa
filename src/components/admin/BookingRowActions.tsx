"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { BookingStatus } from "@/modules/coworking/booking";
import { cancelBookingAction, checkInBookingAction } from "@/app/(dashboard)/(protected)/admin/actions/bookingAdminActions";

interface BookingRowActionsProps {
  bookingId: string;
  estado: BookingStatus;
}

export function BookingRowActions({ bookingId, estado }: BookingRowActionsProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
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
    toast.success("Check-in registrado");
    router.refresh();
  }

  async function handleCancelar() {
    setIsLoading("cancelar");
    setError(null);
    const result = await cancelBookingAction(bookingId);
    setIsLoading(null);
    setOpen(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    toast.success("Reserva cancelada");
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
          <Button variant="destructive" size="sm" disabled={isLoading !== null} onClick={() => setOpen(true)}>
            {isLoading === "cancelar" ? "…" : "Cancelar"}
          </Button>
        ) : null}
      </div>
      {error ? <span className="text-caption text-[--edu-danger-text]">{error}</span> : null}
      <ConfirmDialog
        open={open}
        title="Cancelar reserva"
        description="¿Cancelar esta reserva? Se le va a notificar al usuario."
        confirmLabel="Cancelar reserva"
        onConfirm={handleCancelar}
        onOpenChange={setOpen}
      />
    </div>
  );
}
