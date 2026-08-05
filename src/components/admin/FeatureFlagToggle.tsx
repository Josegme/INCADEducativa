"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FeatureFlag } from "@/lib/flags";
import { setFeatureFlagAction } from "@/app/(dashboard)/admin/actions/featureFlagActions";

interface FeatureFlagToggleProps {
  flag: FeatureFlag;
  label: string;
  etapa: string;
  activo: boolean;
}

export function FeatureFlagToggle({ flag, label, etapa, activo }: FeatureFlagToggleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleClick() {
    setIsLoading(true);
    await setFeatureFlagAction(flag, !activo);
    setIsLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[--edu-border] bg-[--edu-surface-alt] px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium text-white">{label}</span>
        <Badge state="pending">{etapa}</Badge>
        <Badge state={activo ? "completed" : "locked"}>{activo ? "Activo" : "Inactivo"}</Badge>
      </div>
      <Button variant="outline" size="sm" disabled={isLoading} onClick={handleClick}>
        {activo ? "Desactivar" : "Activar"}
      </Button>
    </div>
  );
}
