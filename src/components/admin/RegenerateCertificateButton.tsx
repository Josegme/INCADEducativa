"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { regenerateCertificateAction } from "@/app/(dashboard)/(protected)/admin/actions/certificateActions";

export function RegenerateCertificateButton({ certificateId }: { certificateId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleClick() {
    setIsLoading(true);
    await regenerateCertificateAction(certificateId);
    setIsLoading(false);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" disabled={isLoading} onClick={handleClick}>
      {isLoading ? "Regenerando…" : "Regenerar PDF"}
    </Button>
  );
}
