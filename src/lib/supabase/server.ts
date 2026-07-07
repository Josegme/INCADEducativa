import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Sesión persistente ~30 días (decisión Sprint 1a).
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: SESSION_MAX_AGE_SECONDS,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Se llama desde un Server Component sin permiso de escritura.
            // El middleware ya se encarga de refrescar la sesión en ese caso.
          }
        },
      },
    }
  );
}
