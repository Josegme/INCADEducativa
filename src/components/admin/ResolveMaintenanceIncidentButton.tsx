"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { resolveMaintenanceIncidentAction } from "@/app/(dashboard)/(protected)/admin/actions/maintenanceActions";

export function ResolveMaintenanceIncidentButton({ incidentId }: { incidentId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleClick() {
    setIsLoading(true);
    await resolveMaintenanceIncidentAction(incidentId);
    setIsLoading(false);
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" disabled={isLoading} onClick={handleClick}>
      {isLoading ? "…" : "Marcar resuelta"}
    </Button>
  );
}
