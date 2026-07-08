export type CourseCategory = "marketing" | "finanzas" | "rrhh" | "innovacion";
export type CourseLevel = "basico" | "intermedio" | "avanzado";

export const CATEGORY_LABEL: Record<CourseCategory, string> = {
  marketing: "Marketing",
  finanzas: "Finanzas",
  rrhh: "RRHH / Liderazgo",
  innovacion: "Innovación",
};

export const LEVEL_LABEL: Record<CourseLevel, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export interface MockCareer {
  slug: string;
  nombre: string;
  descripcion: string;
  salidaLaboral: string;
  categoria: CourseCategory;
  courseSlugs: string[];
}

export interface MockCourse {
  slug: string;
  titulo: string;
  descripcion: string;
  categoria: CourseCategory;
  nivel: CourseLevel;
  duracionHs: number;
  esGratuito: boolean;
  /** Mock: progreso del alumno de prueba en este curso. undefined = no inscripto. */
  progresoPct?: number;
}

export const MOCK_CAREERS: MockCareer[] = [
  {
    slug: "marketing-digital",
    nombre: "Marketing Digital",
    descripcion: "Formación integral en marketing digital, redes sociales y performance.",
    salidaLaboral: "Community Manager, Performance Marketer, Especialista en growth.",
    categoria: "marketing",
    courseSlugs: ["fundamentos-marketing-digital", "redes-sociales-y-contenido"],
  },
  {
    slug: "finanzas-corporativas",
    nombre: "Finanzas Corporativas",
    descripcion: "Análisis financiero, presupuestos y toma de decisiones de inversión.",
    salidaLaboral: "Analista financiero, Controller, Asesor de inversiones.",
    categoria: "finanzas",
    courseSlugs: ["finanzas-para-no-financieros"],
  },
  {
    slug: "recursos-humanos",
    nombre: "Recursos Humanos",
    descripcion: "Gestión de talento, liderazgo de equipos y cultura organizacional.",
    salidaLaboral: "Generalista de RRHH, Especialista en talento, Business partner.",
    categoria: "rrhh",
    courseSlugs: ["liderazgo-de-equipos", "seleccion-de-talento"],
  },
  {
    slug: "innovacion-transformacion-digital",
    nombre: "Innovación y Transformación Digital",
    descripcion: "Metodologías ágiles, innovación abierta y transformación de negocios.",
    salidaLaboral: "Product Owner, Agile Coach, Consultor de innovación.",
    categoria: "innovacion",
    courseSlugs: ["introduccion-a-metodologias-agiles"],
  },
];

export const MOCK_COURSES: MockCourse[] = [
  {
    slug: "fundamentos-marketing-digital",
    titulo: "Fundamentos de Marketing Digital",
    descripcion: "Los pilares del marketing digital: canales, funnel y métricas clave.",
    categoria: "marketing",
    nivel: "basico",
    duracionHs: 12,
    esGratuito: true,
    progresoPct: 45,
  },
  {
    slug: "redes-sociales-y-contenido",
    titulo: "Redes Sociales y Estrategia de Contenido",
    descripcion: "Planificación de contenido y gestión profesional de redes sociales.",
    categoria: "marketing",
    nivel: "intermedio",
    duracionHs: 16,
    esGratuito: true,
  },
  {
    slug: "finanzas-para-no-financieros",
    titulo: "Finanzas para No Financieros",
    descripcion: "Lectura de estados contables y análisis financiero aplicado.",
    categoria: "finanzas",
    nivel: "basico",
    duracionHs: 10,
    esGratuito: true,
  },
  {
    slug: "liderazgo-de-equipos",
    titulo: "Liderazgo de Equipos",
    descripcion: "Herramientas de liderazgo, feedback y gestión del desempeño.",
    categoria: "rrhh",
    nivel: "intermedio",
    duracionHs: 14,
    esGratuito: true,
    progresoPct: 100,
  },
  {
    slug: "seleccion-de-talento",
    titulo: "Selección de Talento",
    descripcion: "Procesos de reclutamiento y selección basados en competencias.",
    categoria: "rrhh",
    nivel: "basico",
    duracionHs: 8,
    esGratuito: true,
  },
  {
    slug: "introduccion-a-metodologias-agiles",
    titulo: "Introducción a Metodologías Ágiles",
    descripcion: "Scrum, Kanban y principios ágiles para equipos de producto.",
    categoria: "innovacion",
    nivel: "basico",
    duracionHs: 12,
    esGratuito: true,
  },
];

export function getCourseBySlug(slug: string): MockCourse | undefined {
  return MOCK_COURSES.find((c) => c.slug === slug);
}

export function getCareerBySlug(slug: string): MockCareer | undefined {
  return MOCK_CAREERS.find((c) => c.slug === slug);
}
