import { redirect } from "next/navigation";
import { Award, BookOpen, GraduationCap, LayoutDashboard, Presentation, Users } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import type { SidebarSection } from "@/components/layout/Sidebar";
import type { TopbarRole } from "@/components/layout/Topbar";
import { createClient } from "@/lib/supabase/server";

const ICON_CLASS = "h-[18px] w-[18px]";

function sectionsForRole(role: TopbarRole, canTeach: boolean): SidebarSection[] {
  const sections: SidebarSection[] = [
    {
      label: "Plataforma",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className={ICON_CLASS} aria-hidden /> },
        { label: "Cursos", href: "/cursos", icon: <BookOpen className={ICON_CLASS} aria-hidden /> },
        { label: "Carreras", href: "/carreras", icon: <GraduationCap className={ICON_CLASS} aria-hidden /> },
        { label: "Certificados", href: "/certificados", icon: <Award className={ICON_CLASS} aria-hidden /> },
      ],
    },
  ];

  if (role === "docente" || canTeach) {
    sections.push({
      label: "Docente",
      items: [{ label: "Mis cursos", href: "/docente", icon: <Presentation className={ICON_CLASS} aria-hidden /> }],
    });
  }

  if (role === "admin") {
    sections.push({
      label: "Administración",
      items: [
        { label: "Usuarios", href: "/admin/usuarios", icon: <Users className={ICON_CLASS} aria-hidden /> },
        { label: "Cursos", href: "/admin/cursos", icon: <BookOpen className={ICON_CLASS} aria-hidden /> },
        { label: "Carreras", href: "/admin/carreras", icon: <GraduationCap className={ICON_CLASS} aria-hidden /> },
      ],
    });
  }

  return sections;
}

function initialsFor(nombre?: string | null, apellido?: string | null, email?: string | null) {
  if (nombre || apellido) {
    return `${nombre?.charAt(0) ?? ""}${apellido?.charAt(0) ?? ""}`.toUpperCase();
  }
  return email?.slice(0, 2).toUpperCase();
}

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("nombre, apellido, role, can_teach")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "alumno") as TopbarRole;

  return (
    <DashboardLayout
      sidebarSections={sectionsForRole(role, profile?.can_teach ?? false)}
      userInitials={initialsFor(profile?.nombre, profile?.apellido, user.email)}
      role={role}
    >
      {children}
    </DashboardLayout>
  );
}
