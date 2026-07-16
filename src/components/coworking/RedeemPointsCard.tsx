"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { POINTS_PER_COWORKING_CREDIT, creditsAffordable } from "@/modules/coworking/credits";
import { redeemPointsForCreditAction } from "@/app/(dashboard)/actions/coworkingCreditsActions";

export interface RedeemPointsCardProps {
  puntos: number;
  creditosActuales: number;
}

export function RedeemPointsCard({ puntos, creditosActuales }: RedeemPointsCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const afford = creditsAffordable(puntos);

  async function handleRedeem() {
    setIsLoading(true);
    setError(null);
    const result = await redeemPointsForCreditAction(1);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Ticket className="h-4 w-4 text-[--inc-violet]" aria-hidden />
        <h2 className="text-[13px] font-semibold text-[--edu-text]">Canjear puntos por Coworking</h2>
      </div>

      {error ? <NotificationBanner type="danger">{error}</NotificationBanner> : null}

      <p className="text-[13px] text-[--edu-text-muted]">
        {POINTS_PER_COWORKING_CREDIT} puntos = 1 hora de Coworking. Tenés {creditosActuales} crédito(s) canjeado(s)
        {afford > 0 ? ` — te alcanza para ${afford} más` : ""}.
      </p>

      <Button variant="outline" size="sm" className="w-fit" disabled={isLoading || afford < 1} onClick={handleRedeem}>
        {isLoading ? "Canjeando…" : "Canjear 1 hora de Coworking"}
      </Button>
    </div>
  );
}
