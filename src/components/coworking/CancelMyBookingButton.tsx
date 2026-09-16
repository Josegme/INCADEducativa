"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { cancelMyBookingAction } from "@/app/servicios/coworking/actions/bookingActions";

export function CancelMyBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConfirm() {
    setIsLoading(true);
    setError(null);
    const result = await cancelMyBookingAction(bookingId);
    setIsLoading(false);
    setOpen(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    toast.success("Reserva cancelada");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {error ? <NotificationBanner type="danger">{error}</NotificationBanner> : null}
      <Button variant="destructive" disabled={isLoading} onClick={() => setOpen(true)}>
        {isLoading ? "Cancelando…" : "Cancelar reserva"}
      </Button>
      <ConfirmDialog
        open={open}
        title="Cancelar reserva"
        description="¿Cancelar esta reserva?"
        confirmLabel="Sí, cancelar"
        onConfirm={handleConfirm}
        onOpenChange={setOpen}
      />
    </div>
  );
}
