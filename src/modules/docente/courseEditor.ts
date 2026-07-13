import type { LessonType } from "@/modules/educativa/lessons";

export const LESSON_TYPES: LessonType[] = ["video", "texto", "documento"];

export const LESSON_TYPE_LABEL: Record<LessonType, string> = {
  video: "Video",
  texto: "Texto",
  documento: "Documento",
};

export interface EditableLesson {
  id: string;
  titulo: string;
  tipo: LessonType;
  contenido_url: string | null;
  contenido_text: string | null;
  duracion_min: number | null;
  orden: number;
}

export interface EditableModule {
  id: string;
  titulo: string;
  orden: number;
  lessons: EditableLesson[];
}

export interface EditableCourse {
  id: string;
  titulo: string;
  estado: "borrador" | "revision" | "publicado" | "archivado";
  revision_comentario: string | null;
}
