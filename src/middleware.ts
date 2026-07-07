import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/", "/login", "/activar-cuenta", "/recuperar", "/design-preview"];
const AUTH_ONLY_WHEN_LOGGED_OUT = ["/login", "/recuperar", "/activar-cuenta"];

function isPublicPath(pathname: string) {
  if (pathname.startsWith("/verificar/")) return true;
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

  if (pathname.startsWith("/admin") || pathname.startsWith("/docente")) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    const allowed =
      pathname.startsWith("/admin") ? role === "admin" : role === "admin" || role === "docente";

    if (!allowed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
