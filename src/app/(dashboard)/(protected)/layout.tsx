import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";

/**
 * Guard de sesión para todo lo que estaba antes directo bajo (dashboard) —
 * se separó a este subgrupo para que /carreras (fuera de acá) pueda ser
 * pública (vitrina, CU-T02/ADR-15) sin tocar el resto de rutas autenticadas.
 * El layout padre (dashboard)/layout.tsx sigue armando el shell (Sidebar/
 * Topbar) para cualquier request con sesión, autenticado o no esté en esta
 * rama — acá solo se corta el paso si no hay sesión.
 */
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
