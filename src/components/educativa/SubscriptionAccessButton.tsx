"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { enrollViaSubscriptionAction } from "@/app/(dashboard)/cursos/actions/subscriptionActions";

interface SubscriptionAccessButtonProps {
  courseId: string;
  courseSlug: string;
}

export function SubscriptionAccessButton({ courseId, courseSlug }: SubscriptionAccessButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleAccess() {
    setIsLoading(true);
    setError(null);
    const result = await enrollViaSubscriptionAction(courseId, courseSlug);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {error ? (
        <NotificationBanner type="danger" className="max-w-xs">
          {error}
        </NotificationBanner>
      ) : null}
      <Button variant="primary" onClick={handleAccess} disabled={isLoading}>
        {isLoading ? "Activando…" : "Acceder con tu suscripción"}
      </Button>
    </div>
  );
}
