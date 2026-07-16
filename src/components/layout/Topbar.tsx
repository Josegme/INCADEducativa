import * as React from "react";
import Link from "next/link";

import { NotificationBell } from "@/components/layout/NotificationBell";
import { cn } from "@/lib/utils";

export interface TopbarNavItem {
  label: string;
  href: string;
  active?: boolean;
}

export type TopbarRole = "admin" | "docente" | "alumno" | "coordinador";

const roleBadgeStyles: Record<TopbarRole, string> = {
  admin: "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]",
  docente: "border-[rgba(192,38,211,0.30)] bg-[rgba(192,38,211,0.15)] text-[--inc-magenta-text]",
  alumno: "border-[--edu-success-border] bg-[--edu-success-subtle] text-[--edu-success-text]",
  coordinador: "border-[--edu-warning-border] bg-[--edu-warning-subtle] text-[--edu-warning-text]",
};

export interface TopbarProps {
  navItems?: TopbarNavItem[];
  userInitials?: string;
  role?: TopbarRole;
  roleLabel?: string;
  userId?: string;
}

export function Topbar({ navItems = [], userInitials, role, roleLabel, userId }: TopbarProps) {
  return (
    <header className="flex h-[46px] items-center justify-between border-b-[0.5px] border-[--edu-border] bg-black/[0.55] px-4 backdrop-blur-[8px]">
      <div className="flex items-center gap-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[--inc-violet] text-[11px] font-semibold text-white">
          IN
        </div>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-[5px] px-[11px] py-[5px] text-[13px] transition-colors",
                item.active
                  ? "bg-[--inc-violet-subtle] font-semibold text-[--inc-violet-text]"
                  : "font-medium text-[--edu-text-muted] hover:bg-white/5"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {userId ? <NotificationBell userId={userId} /> : null}
        {role ? (
          <span
            className={cn(
              "rounded-sm border-[0.5px] px-2 py-0.5 text-[12px] font-semibold capitalize",
              roleBadgeStyles[role]
            )}
          >
            {roleLabel ?? role}
          </span>
        ) : null}
        {userInitials ? (
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] border-[--inc-violet-border-strong] bg-[--inc-violet] text-[11px] font-semibold text-white">
            {userInitials}
          </div>
        ) : null}
      </div>
    </header>
  );
}
