"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { setCanTeachAction } from "@/app/(dashboard)/admin/actions/convertRoleActions";

interface CanTeachToggleProps {
  userId: string;
  canTeach: boolean;
}

export function CanTeachToggle({ userId, canTeach }: CanTeachToggleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleClick() {
    setIsLoading(true);
    await setCanTeachAction(userId, !canTeach);
    setIsLoading(false);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" disabled={isLoading} onClick={handleClick}>
      {canTeach ? "Quitar docente" : "Habilitar docente"}
    </Button>
  );
}
