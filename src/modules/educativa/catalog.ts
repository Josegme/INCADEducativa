export type CourseLevel = "basico" | "intermedio" | "avanzado";

export const LEVEL_LABEL: Record<CourseLevel, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export interface CatalogCareer {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
}

export interface CatalogCourse {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string | null;
  nivel: CourseLevel;
  duracionHs: number | null;
  esGratuito: boolean;
  carrera: CatalogCareer | null;
  /** undefined = no inscripto */
  progresoPct?: number;
}
