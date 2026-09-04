"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { resolveMaintenanceIncidentAction } from "@/app/(dashboard)/(protected)/admin/actions/maintenanceActions";

export function ResolveMaintenanceIncidentButton({ incidentId }: { incidentId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setError(null);
    const result = await resolveMaintenanceIncidentAction(incidentId);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant="outline" size="sm" disabled={isLoading} onClick={handleClick}>
        {isLoading ? "…" : "Marcar resuelta"}
      </Button>
      {error ? <span className="text-[12px] text-[--edu-danger-text]">{error}</span> : null}
    </div>
  );
}
