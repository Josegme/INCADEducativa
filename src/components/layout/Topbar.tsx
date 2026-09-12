"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface TopbarNavItem {
  label: string;
  href: string;
  active?: boolean;
}

export type TopbarRole = "admin" | "docente" | "alumno" | "coordinador" | "comunidad" | "lead";

const roleBadgeStyles: Record<TopbarRole, string> = {
  admin: "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]",
  docente: "border-[--inc-magenta] bg-[--inc-magenta-subtle] text-[--inc-magenta-text]",
  alumno: "border-[--edu-success-border] bg-[--edu-success-subtle] text-[--edu-success-text]",
  coordinador: "border-[--edu-warning-border] bg-[--edu-warning-subtle] text-[--edu-warning-text]",
  comunidad: "border-[--edu-border] bg-white/5 text-[--edu-text-muted]",
  lead: "border-[--edu-border] bg-white/5 text-[--edu-text-muted]",
};

export interface TopbarProps {
  navItems?: TopbarNavItem[];
  userInitials?: string;
  avatarUrl?: string | null;
  role?: TopbarRole;
  roleLabel?: string;
  userId?: string;
  onOpenMenu?: () => void;
}

export function Topbar({
  navItems = [],
  userInitials,
  avatarUrl,
  role,
  roleLabel,
  userId,
  onOpenMenu,
}: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b-[0.5px] border-[--edu-border] bg-black/55 px-4 backdrop-blur-[8px]">
      <div className="flex items-center gap-3">
        {onOpenMenu ? (
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={onOpenMenu} aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </Button>
        ) : null}
        <Link href="/dashboard" className="flex h-7 w-7 items-center justify-center rounded-md bg-[--inc-violet] text-caption font-semibold text-white">
          IN
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-body transition-colors",
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
          <span className={cn("hidden rounded-sm border-[0.5px] px-2 py-0.5 text-caption font-semibold capitalize sm:inline", roleBadgeStyles[role])}>
            {roleLabel ?? role}
          </span>
        ) : null}
        {userInitials || avatarUrl ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="rounded-full" aria-label="Menú de cuenta">
                <Avatar>
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt="Mi perfil" /> : null}
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/perfil">Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1">
                <LogoutButton />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
}
