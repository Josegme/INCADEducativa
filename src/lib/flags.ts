/**
 * Feature flags de INCADEducativa.
 * Fuente: variables de entorno (ver CLAUDE.md, regla crítica #6).
 * Nunca hardcodear módulos desactivados.
 */
export const flags = {
  educativa: process.env.FEATURE_EDUCATIVA === 'true',   // E1 — producto central
  coworking: process.env.FEATURE_COWORKING === 'true',   // E2
  tutorias: process.env.FEATURE_TUTORIAS === 'true',     // E2
  talleres: process.env.FEATURE_TALLERES === 'true',     // E2
  comunidad: process.env.FEATURE_COMUNIDAD === 'true',   // E3
  publica: process.env.FEATURE_PUBLICA === 'true',       // E3
} as const;

export type FeatureFlag = keyof typeof flags;

export function isEnabled(flag: FeatureFlag): boolean {
  return flags[flag];
}
