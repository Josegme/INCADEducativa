"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { toggleMembershipPlanActiveAction } from "@/app/(dashboard)/admin/actions/membershipPlanActions";

export function MembershipPlanActiveToggle({ planId, activo }: { planId: string; activo: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleClick() {
    setIsLoading(true);
    await toggleMembershipPlanActiveAction(planId, !activo);
    setIsLoading(false);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" disabled={isLoading} onClick={handleClick}>
      {activo ? "Desactivar" : "Activar"}
    </Button>
  );
}
