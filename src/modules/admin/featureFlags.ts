import type { FeatureFlag } from "@/lib/flags";

export const TOGGLEABLE_FLAGS: { flag: Exclude<FeatureFlag, "educativa">; label: string; etapa: string }[] = [
  { flag: "coworking", label: "Coworking", etapa: "E2" },
  { flag: "tutorias", label: "Tutorías", etapa: "E2" },
  { flag: "talleres", label: "Talleres", etapa: "E2" },
  { flag: "comunidad", label: "Comunidad / foro", etapa: "E3" },
  { flag: "publica", label: "Catálogo público", etapa: "E3" },
];
