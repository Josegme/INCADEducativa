"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { payBookingBalanceAction } from "@/app/servicios/coworking/actions/bookingActions";

export function PayBalanceButton({ bookingId, saldo }: { bookingId: string; saldo: number }) {
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function handleClick() {
    setPending(true);
    setError(null);
    const result = await payBookingBalanceAction(bookingId);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleClick} disabled={pending}>
        {pending ? "Redirigiendo…" : `Pagar saldo restante ($${saldo})`}
      </Button>
      {error ? <p className="text-caption text-[--edu-danger-text]">{error}</p> : null}
    </div>
  );
}
