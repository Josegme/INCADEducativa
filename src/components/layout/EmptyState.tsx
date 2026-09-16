import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function EmptyState({ icon: Icon, title, description, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface] px-6 py-12 text-center">
      <Icon className="h-8 w-8 text-[--inc-violet-text]" aria-hidden />
      <h2 className="text-section font-semibold text-white">{title}</h2>
      <p className="max-w-md text-body text-[--edu-text-muted]">{description}</p>
      {actionHref && actionLabel ? (
        <Button asChild size="sm">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
