import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-lg border-[0.5px] shadow-card transition-shadow hover:border-[--edu-border-strong] hover:shadow-card-violet",
  {
    variants: {
      variant: {
        default: "border-[--edu-border] bg-[--edu-surface]",
        elevated: "border-[--edu-border] bg-[--edu-surface-alt]",
        raised: "border-[--edu-border] bg-[--edu-surface-raised]",
        certificate: "border-[--edu-gold-border] bg-[--edu-gold-subtle]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type CardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants>;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, className }))} {...props} />
  )
);
Card.displayName = "Card";

export { Card, cardVariants };
