import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const bannerVariants = cva(
  "flex items-start gap-[10px] rounded-md border-[0.5px] px-[14px] py-[10px] text-[13px]",
  {
    variants: {
      type: {
        info: "border-[--inc-violet-border-strong] bg-[--inc-violet-subtle] text-[--inc-violet-text]",
        success: "border-[--edu-success-border] bg-[--edu-success-subtle] text-[--edu-success-text]",
        warning: "border-[--edu-warning-border] bg-[--edu-warning-subtle] text-[--edu-warning-text]",
        danger: "border-[--edu-danger-border] bg-[--edu-danger-subtle] text-[--edu-danger-text]",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
);

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
} as const;

export type NotificationBannerProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof bannerVariants>;

function NotificationBanner({
  className,
  type = "info",
  children,
  ...props
}: NotificationBannerProps) {
  const Icon = icons[type ?? "info"];
  return (
    <div className={cn(bannerVariants({ type, className }))} {...props}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export { NotificationBanner };
