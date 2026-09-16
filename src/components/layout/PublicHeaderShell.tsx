import Link from "next/link";

/**
 * Shell mínimo para páginas públicas dentro de (dashboard) sin sesión — hoy
 * solo /carreras (vitrina, CU-T02/ADR-15). No es el DashboardLayout
 * completo (Sidebar/Topbar de usuario autenticado): un header simple con
 * logo + link a login, mismo fondo/padding que el shell autenticado para
 * que las páginas no salten visualmente al loguearse.
 */
export function PublicHeaderShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-edu-bg">
      <header className="flex h-[46px] items-center justify-between border-b-[0.5px] border-[--edu-border] bg-black/[0.55] px-4 backdrop-blur-[8px]">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[--inc-violet] text-[11px] font-semibold text-white">
            IN
          </div>
          <span className="text-[13px] font-semibold text-white">INCADEducativa</span>
        </Link>
        <Link href="/login" className="text-[13px] font-medium text-[--inc-violet-text] hover:underline">
          Iniciar sesión
        </Link>
      </header>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
