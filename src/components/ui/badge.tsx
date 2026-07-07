import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border-[0.5px] px-2 py-0.5 text-[12px] font-semibold",
  {
    variants: {
      state: {
        active: "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]",
        completed: "border-[--edu-success-border] bg-[--edu-success-subtle] text-[--edu-success-text]",
        pending: "border-[--edu-warning-border] bg-[--edu-warning-subtle] text-[--edu-warning-text]",
        error: "border-[--edu-danger-border] bg-[--edu-danger-subtle] text-[--edu-danger-text]",
        locked: "border-white/[0.08] bg-white/5 text-[--edu-text-faint]",
        gold: "border-[--edu-gold-border] bg-[--edu-gold-subtle] text-[--edu-gold]",
      },
      pill: {
        true: "rounded-pill",
      },
    },
    defaultVariants: {
      state: "active",
    },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, state, pill, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ state, pill, className }))} {...props} />;
}

export { Badge, badgeVariants };
