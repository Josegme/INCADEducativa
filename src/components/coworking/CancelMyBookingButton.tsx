"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { cancelMyBookingAction } from "@/app/servicios/coworking/actions/bookingActions";

export function CancelMyBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleClick() {
    if (!window.confirm("¿Cancelar esta reserva?")) return;
    setIsLoading(true);
    setError(null);
    const result = await cancelMyBookingAction(bookingId);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {error ? <NotificationBanner type="danger">{error}</NotificationBanner> : null}
      <Button variant="destructive" disabled={isLoading} onClick={handleClick}>
        {isLoading ? "Cancelando…" : "Cancelar reserva"}
      </Button>
    </div>
  );
}
