export type LessonType = "video" | "texto" | "documento";

export interface LessonRow {
  id: string;
  titulo: string;
  tipo: LessonType;
  contenido_url: string | null;
  contenido_text: string | null;
  duracion_min: number | null;
  orden: number;
}

export interface ModuleWithLessons {
  id: string;
  titulo: string;
  orden: number;
  lessons: LessonRow[];
}

export interface LessonState extends LessonRow {
  moduleId: string;
  moduleTitulo: string;
  locked: boolean;
  completed: boolean;
  tiempoVistoSeg: number;
}
