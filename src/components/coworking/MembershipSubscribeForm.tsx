"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { createMembershipAction } from "@/app/servicios/coworking/actions/membershipActions";

export function MembershipSubscribeForm({ planId }: { planId: string }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("planId", planId);

    const result = await createMembershipAction(formData);
    // Si sale todo bien, createMembershipAction hace redirect() internamente
    // (nunca llega acá). Solo llegamos si hubo un error real.
    setIsLoading(false);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error ? <NotificationBanner type="danger">{error}</NotificationBanner> : null}
      <Button type="submit" size="lg" disabled={isLoading} className="w-fit">
        {isLoading ? "Procesando…" : "Suscribirme y pagar"}
      </Button>
    </form>
  );
}
