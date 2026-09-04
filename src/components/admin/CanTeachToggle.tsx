"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { setCanTeachAction } from "@/app/(dashboard)/(protected)/admin/actions/convertRoleActions";

interface CanTeachToggleProps {
  userId: string;
  canTeach: boolean;
}

export function CanTeachToggle({ userId, canTeach }: CanTeachToggleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setError(null);
    const result = await setCanTeachAction(userId, !canTeach);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant="ghost" size="sm" disabled={isLoading} onClick={handleClick}>
        {canTeach ? "Quitar docente" : "Habilitar docente"}
      </Button>
      {error ? <span className="text-[12px] text-[--edu-danger-text]">{error}</span> : null}
    </div>
  );
}
