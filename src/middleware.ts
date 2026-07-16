import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/", "/login", "/activar-cuenta", "/recuperar", "/design-preview"];
const AUTH_ONLY_WHEN_LOGGED_OUT = ["/login", "/recuperar", "/activar-cuenta"];

function isPublicPath(pathname: string) {
  if (pathname.startsWith("/verificar/")) return true;
  // Coworking es un servicio público desde E2 (Addendum 03 §2.1) — la landing
  // y el catálogo se ven sin login; el login recién se pide al reservar.
  if (pathname.startsWith("/servicios/coworking")) return true;
  // Webhooks de servicios externos (MercadoPago) llegan sin sesión de usuario
  // — la seguridad la da la verificación de x-signature dentro del route
  // handler (CLAUDE.md regla #9), no el middleware de auth.
  if (pathname.startsWith("/api/")) return true;
  return PUBLIC_PATHS.includes(pathname);
}

export async function middleware(request: NextRequest) {
  const { response, supabase, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (!user) {
    if (!isPublicPath(pathname) && pathname !== "/actualizar-password") {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  if (AUTH_ONLY_WHEN_LOGGED_OUT.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/docente") || pathname.startsWith("/coordinador")) {
    const { data: profile } = await supabase
      .from("users")
      .select("role, can_teach")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    const allowed = pathname.startsWith("/admin")
      ? role === "admin"
      : pathname.startsWith("/coordinador")
        ? role === "admin" || role === "coordinador"
        : role === "admin" || role === "docente" || profile?.can_teach === true;

    if (!allowed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
