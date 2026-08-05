import { createClient } from "@/lib/supabase/server";

/**
 * Feature flags de INCADEducativa.
 * Fuente: tabla `feature_flags` (migración 020), con fallback a env vars si
 * no hay fila para el flag — ver CLAUDE.md v3.6, regla #6. `educativa` (E1,
 * producto central) no tiene UI de apagado en /admin, ver COMPONENTS.md §60.
 */
export type FeatureFlag = "educativa" | "coworking" | "tutorias" | "talleres" | "comunidad" | "publica";

const ENV_FLAGS: Record<FeatureFlag, boolean> = {
  educativa: process.env.FEATURE_EDUCATIVA === "true", // E1 — producto central
  coworking: process.env.FEATURE_COWORKING === "true", // E2
  tutorias: process.env.FEATURE_TUTORIAS === "true", // E2
  talleres: process.env.FEATURE_TALLERES === "true", // E2
  comunidad: process.env.FEATURE_COMUNIDAD === "true", // E3
  publica: process.env.FEATURE_PUBLICA === "true", // E3
};

export async function getFlags(): Promise<Record<FeatureFlag, boolean>> {
  const supabase = await createClient();
  const { data } = await supabase.from("feature_flags").select("flag, activo");
  const overrides = new Map((data ?? []).map((row) => [row.flag as FeatureFlag, row.activo as boolean]));

  return {
    educativa: overrides.get("educativa") ?? ENV_FLAGS.educativa,
    coworking: overrides.get("coworking") ?? ENV_FLAGS.coworking,
    tutorias: overrides.get("tutorias") ?? ENV_FLAGS.tutorias,
    talleres: overrides.get("talleres") ?? ENV_FLAGS.talleres,
    comunidad: overrides.get("comunidad") ?? ENV_FLAGS.comunidad,
    publica: overrides.get("publica") ?? ENV_FLAGS.publica,
  };
}
