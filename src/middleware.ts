import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/", "/login", "/activar-cuenta", "/recuperar", "/design-preview", "/cuenta-desactivada"];
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

function moduleRouteFor(pathname: string): "coworking" | "talleres" | "tutorias" | null {
  if (
    pathname.startsWith("/servicios/coworking") ||
    pathname.startsWith("/admin/coworking") ||
    pathname.startsWith("/coordinador")
  ) {
    return "coworking";
  }
  if (pathname.startsWith("/talleres") || pathname.startsWith("/admin/talleres")) {
    return "talleres";
  }
  if (pathname.startsWith("/docente/cursos/") && pathname.includes("/tutorias")) {
    return "tutorias";
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { response, supabase, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Feature flags: solo se consulta la DB si la ruta pertenece a un módulo
  // togglable (evita una query extra en cada request, incluidos webhooks).
  const moduleRoute = moduleRouteFor(pathname);
  if (moduleRoute) {
    const { data: flagRows } = await supabase
      .from("feature_flags")
      .select("flag, activo")
      .in("flag", ["coworking", "talleres", "tutorias"]);
    const overrides = new Map((flagRows ?? []).map((row) => [row.flag as string, row.activo as boolean]));
    const envFallback: Record<"coworking" | "talleres" | "tutorias", boolean> = {
      coworking: process.env.FEATURE_COWORKING === "true",
      talleres: process.env.FEATURE_TALLERES === "true",
      tutorias: process.env.FEATURE_TUTORIAS === "true",
    };
    const moduleActive = overrides.get(moduleRoute) ?? envFallback[moduleRoute];

    if (!moduleActive) {
      return NextResponse.redirect(new URL(user ? "/dashboard" : "/", request.url));
    }
  }

  if (!user) {
    if (!isPublicPath(pathname) && pathname !== "/actualizar-password") {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, can_teach, activo")
    .eq("id", user.id)
    .single();

  if (profile?.activo === false && pathname !== "/cuenta-desactivada") {
    await supabase.auth.signOut();
    const redirectResponse = NextResponse.redirect(new URL("/cuenta-desactivada", request.url));
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (AUTH_ONLY_WHEN_LOGGED_OUT.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/docente") || pathname.startsWith("/coordinador")) {
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
