"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { toggleSpaceActiveAction } from "@/app/(dashboard)/admin/actions/coworkingActions";

export function SpaceActiveToggle({ spaceId, activo }: { spaceId: string; activo: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleClick() {
    setIsLoading(true);
    await toggleSpaceActiveAction(spaceId, !activo);
    setIsLoading(false);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" disabled={isLoading} onClick={handleClick}>
      {activo ? "Desactivar" : "Activar"}
    </Button>
  );
}
