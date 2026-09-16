import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type ProfileRow = Database["public"]["Tables"]["users"]["Row"];
export type UserRole = Database["public"]["Enums"]["user_role"];

/**
 * Auth + perfil memoizados por request (React cache).
 * Evita que middleware-adyacente + layout + page llamen getUser()/users 4 veces.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, email, nombre, apellido, dni, role, carrera_id, avatar_url, puntos, activo, can_teach, notification_prefs, coworking_creditos_canje, onboarding_ok")
    .eq("id", user.id)
    .maybeSingle();

  return data;
});
