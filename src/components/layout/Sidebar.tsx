"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export interface SidebarNavItem {
  label: string;
  href: string;
  /**
   * Ícono ya renderizado (ej. `<LayoutDashboard className="h-[18px] w-[18px]" />`).
   * Se recibe como nodo, no como referencia a componente, para poder pasarlo
   * desde un Server Component hacia este componente ("use client" por el
   * `usePathname`) sin romper la serialización RSC.
   */
  icon: React.ReactNode;
  /** Fuerza el estado activo. Por defecto se detecta por la ruta actual. */
  active?: boolean;
  badge?: number;
}

export interface SidebarSection {
  label?: string;
  items: SidebarNavItem[];
}

export interface SidebarProps {
  sections: SidebarSection[];
}

export function Sidebar({ sections }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[180px] shrink-0 flex-col gap-1 border-r-[0.5px] border-[--edu-border] bg-black/30 bg-[--edu-surface] p-[10px_8px]">
      {sections.map((section, sectionIndex) => (
        <div key={section.label ?? sectionIndex} className="flex flex-col gap-0.5">
          {section.label ? (
            <span className="px-[6px] pb-[3px] pt-2 text-[11px] font-semibold uppercase tracking-[1.2px] text-[--edu-text-faint]">
              {section.label}
            </span>
          ) : null}
          {section.items.map((item) => {
            const isActive = item.active ?? pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md px-[8px] py-[6px] text-[13px] font-medium transition-colors",
                  isActive
                    ? "border-l-2 border-[--inc-violet] bg-[--inc-violet-subtle] font-semibold text-[--inc-violet-text]"
                    : "border-l-2 border-transparent text-[--edu-text-faint] hover:bg-white/5 hover:text-[--edu-text-muted]"
                )}
              >
                <span className="flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </span>
                {typeof item.badge === "number" && item.badge > 0 ? (
                  <span className="rounded-pill bg-[--inc-violet] px-[6px] py-[1px] text-[11px] font-semibold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
