"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { toggleCouponActiveAction } from "@/app/(dashboard)/(protected)/admin/actions/couponActions";

export function CouponActiveToggle({ couponId, activo }: { couponId: string; activo: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleClick() {
    setIsLoading(true);
    await toggleCouponActiveAction(couponId, !activo);
    setIsLoading(false);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" disabled={isLoading} onClick={handleClick}>
      {activo ? "Desactivar" : "Activar"}
    </Button>
  );
}
