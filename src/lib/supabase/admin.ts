import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con `service_role` — bypassa RLS. Server-only, nunca importar desde
 * un componente cliente. Reservado para el Admin API de Auth (invitar usuarios);
 * las operaciones sobre tablas (`public.*`) siguen yendo por el cliente normal
 * con RLS (`is_admin()`), no por acá.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
