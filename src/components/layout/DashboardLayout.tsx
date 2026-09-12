"use client";

import * as React from "react";

import { Sidebar, type SidebarSection } from "./Sidebar";
import { Topbar, type TopbarNavItem, type TopbarRole } from "./Topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export interface DashboardLayoutProps {
  sidebarSections: SidebarSection[];
  topbarNavItems?: TopbarNavItem[];
  userInitials?: string;
  avatarUrl?: string | null;
  role?: TopbarRole;
  roleLabel?: string;
  userId?: string;
  children: React.ReactNode;
}

export function DashboardLayout({
  sidebarSections,
  topbarNavItems,
  userInitials,
  avatarUrl,
  role,
  roleLabel,
  userId,
  children,
}: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen w-full bg-edu-bg">
      <Sidebar sections={sidebarSections} className="hidden lg:flex" />
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="p-0">
          <Sidebar sections={sidebarSections} className="w-full border-0" onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          navItems={topbarNavItems}
          userInitials={userInitials}
          avatarUrl={avatarUrl}
          role={role}
          roleLabel={roleLabel}
          userId={userId}
          onOpenMenu={() => setMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
