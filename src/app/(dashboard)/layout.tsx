import { redirect } from "next/navigation";
import {
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  DoorOpen,
  GraduationCap,
  LayoutDashboard,
  LayoutGrid,
  Presentation,
  Users,
  Wallet,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import type { SidebarSection } from "@/components/layout/Sidebar";
import type { TopbarRole } from "@/components/layout/Topbar";
import { flags } from "@/lib/flags";
import { createClient } from "@/lib/supabase/server";

const ICON_CLASS = "h-[18px] w-[18px]";

function sectionsForRole(role: TopbarRole, canTeach: boolean): SidebarSection[] {
  const platformItems: SidebarSection["items"] = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className={ICON_CLASS} aria-hidden /> },
    { label: "Cursos", href: "/cursos", icon: <BookOpen className={ICON_CLASS} aria-hidden /> },
    { label: "Carreras", href: "/carreras", icon: <GraduationCap className={ICON_CLASS} aria-hidden /> },
    { label: "Certificados", href: "/certificados", icon: <Award className={ICON_CLASS} aria-hidden /> },
  ];

  // Coworking es un ítem de primer nivel, no un submódulo educativo — Addendum 03 §2.2.
  if (flags.coworking) {
    platformItems.push({ label: "Coworking", href: "/servicios/coworking", icon: <DoorOpen className={ICON_CLASS} aria-hidden /> });
  }

  const sections: SidebarSection[] = [{ label: "Plataforma", items: platformItems }];

  if (role === "docente" || canTeach) {
    sections.push({
      label: "Docente",
      items: [{ label: "Mis cursos", href: "/docente", icon: <Presentation className={ICON_CLASS} aria-hidden /> }],
    });
  }

  if (role === "admin") {
    const adminItems: SidebarSection["items"] = [
      { label: "Usuarios", href: "/admin/usuarios", icon: <Users className={ICON_CLASS} aria-hidden /> },
      { label: "Cursos", href: "/admin/cursos", icon: <BookOpen className={ICON_CLASS} aria-hidden /> },
      { label: "Carreras", href: "/admin/carreras", icon: <GraduationCap className={ICON_CLASS} aria-hidden /> },
    ];

    if (flags.coworking) {
      adminItems.push(
        { label: "Sedes Coworking", href: "/admin/coworking/sedes", icon: <Building2 className={ICON_CLASS} aria-hidden /> },
        { label: "Espacios Coworking", href: "/admin/coworking/espacios", icon: <DoorOpen className={ICON_CLASS} aria-hidden /> },
        { label: "Ocupación Coworking", href: "/admin/coworking/ocupacion", icon: <LayoutGrid className={ICON_CLASS} aria-hidden /> },
        { label: "Reservas Coworking", href: "/admin/coworking/reservas", icon: <CalendarDays className={ICON_CLASS} aria-hidden /> },
        { label: "Ingresos Coworking", href: "/admin/coworking/ingresos", icon: <Wallet className={ICON_CLASS} aria-hidden /> }
      );
    }

    sections.push({ label: "Administración", items: adminItems });
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
      userId={user.id}
    >
      {children}
    </DashboardLayout>
  );
}
