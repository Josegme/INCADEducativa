import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Miga de pan" className={cn("flex flex-wrap items-center gap-1 text-caption text-[--edu-text-muted]", className)}>
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? <ChevronRight className="h-3.5 w-3.5" aria-hidden /> : null}
            {item.href && !last ? (
              <Link href={item.href} className="hover:text-[--inc-violet-text]">
                {item.label}
              </Link>
            ) : (
              <span className={cn(last && "font-medium text-white")} aria-current={last ? "page" : undefined}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
