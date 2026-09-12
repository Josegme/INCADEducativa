import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";

type AppSupabase = SupabaseClient<Database>;

export async function requireUser() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("No autenticado");
  }
  return { supabase, user };
}

export async function requireAdmin(message = "Solo el administrador puede realizar esta acción") {
  const { supabase, user } = await requireUser();
  const profile = await getCurrentProfile();

  if (profile?.role !== "admin") {
    throw new Error(message);
  }

  return { supabase, adminId: user.id, user, profile };
}

export async function requireCoordinador(message = "Solo coordinadores pueden realizar esta acción") {
  const { supabase, user } = await requireUser();
  const profile = await getCurrentProfile();

  if (profile?.role !== "coordinador" && profile?.role !== "admin") {
    throw new Error(message);
  }

  return { supabase, userId: user.id, user, profile };
}

export async function requireCanTeach(courseId: string) {
  const { supabase, user } = await requireUser();
  const profile = await getCurrentProfile();

  if (profile?.role === "admin") {
    return { supabase, user, profile };
  }

  const { data: course } = await supabase.from("courses").select("docente_id").eq("id", courseId).maybeSingle();
  const ownsCourse = course?.docente_id === user.id;
  const canTeach = Boolean(profile?.can_teach) && ownsCourse;

  if (!canTeach && !ownsCourse && profile?.role !== "docente") {
    throw new Error("No tenés permiso para este curso");
  }

  return { supabase, user, profile };
}

export type { AppSupabase };
