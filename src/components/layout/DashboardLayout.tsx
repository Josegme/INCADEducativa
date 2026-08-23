import * as React from "react";

import { Sidebar, type SidebarSection } from "./Sidebar";
import { Topbar, type TopbarNavItem, type TopbarRole } from "./Topbar";

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
  return (
    <div className="flex min-h-screen w-full bg-edu-bg">
      <Sidebar sections={sidebarSections} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          navItems={topbarNavItems}
          userInitials={userInitials}
          avatarUrl={avatarUrl}
          role={role}
          roleLabel={roleLabel}
          userId={userId}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
