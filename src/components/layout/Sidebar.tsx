"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: number;
}

export interface SidebarSection {
  label?: string;
  items: SidebarNavItem[];
  collapsible?: boolean;
}

export interface SidebarProps {
  sections: SidebarSection[];
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ sections, className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.filter((s) => s.collapsible && s.label).map((s) => [s.label as string, true]))
  );

  return (
    <aside
      className={cn(
        "flex h-full w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r-[0.5px] border-[--edu-border] bg-[--edu-surface] p-2",
        className
      )}
    >
      {sections.map((section, sectionIndex) => {
        const key = section.label ?? String(sectionIndex);
        const collapsed = section.collapsible && section.label ? !openGroups[section.label] : false;
        return (
          <div key={key} className="flex flex-col gap-0.5">
            {section.label ? (
              section.collapsible ? (
                <button
                  type="button"
                  className="flex items-center justify-between px-2 pb-1 pt-2 text-caption font-semibold uppercase tracking-wide text-[--edu-text-faint]"
                  onClick={() => setOpenGroups((prev) => ({ ...prev, [section.label as string]: !prev[section.label as string] }))}
                >
                  {section.label}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", collapsed && "-rotate-90")} aria-hidden />
                </button>
              ) : (
                <span className="px-2 pb-1 pt-2 text-caption font-semibold uppercase tracking-wide text-[--edu-text-faint]">
                  {section.label}
                </span>
              )
            ) : null}
            {!collapsed
              ? section.items.map((item) => {
                  const isActive = item.active ?? (pathname === item.href || pathname.startsWith(`${item.href}/`));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-md border-l-2 px-2 py-1.5 text-body font-medium transition-colors",
                        isActive
                          ? "border-[--inc-violet] bg-[--inc-violet-subtle] font-semibold text-[--inc-violet-text]"
                          : "border-transparent text-[--edu-text-muted] hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {item.icon}
                        {item.label}
                      </span>
                      {typeof item.badge === "number" && item.badge > 0 ? (
                        <span className="rounded-pill bg-[--inc-violet] px-1.5 text-caption font-semibold text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })
              : null}
          </div>
        );
      })}
    </aside>
  );
}
