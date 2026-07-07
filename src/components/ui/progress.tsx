import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const progressFillVariants = cva("h-full w-full flex-1 transition-transform", {
  variants: {
    variant: {
      default: "bg-[linear-gradient(90deg,var(--inc-violet),var(--inc-magenta))]",
      success: "bg-[--edu-success]",
      warning: "bg-[--edu-warning]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressFillVariants> {
  value?: number;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    value={value}
    className={cn("relative h-1 w-full overflow-hidden rounded-pill bg-white/[0.08]", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(progressFillVariants({ variant }))}
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
