export type EvaluationTipo = "cuestionario_modulo" | "examen_final" | "tp";

export const EVALUATION_TIPO_LABEL: Record<EvaluationTipo, string> = {
  cuestionario_modulo: "Cuestionario de módulo",
  examen_final: "Examen final",
  tp: "Entrega de TP",
};

export type QuestionType = "vf_fundamentada" | "opcion_unica" | "opcion_multiple" | "abierta" | "entrega_tp";

export const QUESTION_TYPES: QuestionType[] = [
  "vf_fundamentada",
  "opcion_unica",
  "opcion_multiple",
  "abierta",
  "entrega_tp",
];

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  vf_fundamentada: "Verdadero/Falso fundamentado",
  opcion_unica: "Opción única",
  opcion_multiple: "Opción múltiple",
  abierta: "Pregunta abierta",
  entrega_tp: "Entrega de TP",
};

export type SubmissionKind = "archivo" | "drive" | "github" | "url" | "texto";

export const SUBMISSION_KIND_LABEL: Record<SubmissionKind, string> = {
  archivo: "Archivo (PDF/DOCX/imagen/ZIP)",
  drive: "Link de Google Drive",
  github: "Link de GitHub",
  url: "URL externa",
  texto: "Texto en la plataforma",
};

interface QuestionBase {
  id: string;
  enunciado: string;
  peso: number;
}

export interface QuestionVF extends QuestionBase {
  tipo: "vf_fundamentada";
  respuesta_correcta: boolean;
  min_caracteres_fundamentacion: number;
}

export interface QuestionOpcionUnica extends QuestionBase {
  tipo: "opcion_unica";
  opciones: string[];
  respuesta_correcta: number;
  retroalimentacion: string;
}

export interface QuestionOpcionMultiple extends QuestionBase {
  tipo: "opcion_multiple";
  opciones: string[];
  respuestas_correctas: number[];
  puntuacion: "proporcional" | "todo_o_nada";
}

export interface QuestionAbierta extends QuestionBase {
  tipo: "abierta";
}

export interface QuestionEntregaTp extends QuestionBase {
  tipo: "entrega_tp";
  tipos_entrega: SubmissionKind[];
}

export type EvaluationQuestion =
  | QuestionVF
  | QuestionOpcionUnica
  | QuestionOpcionMultiple
  | QuestionAbierta
  | QuestionEntregaTp;

function newId() {
  return globalThis.crypto.randomUUID();
}

export function createEmptyQuestion(tipo: QuestionType): EvaluationQuestion {
  const base = { id: newId(), enunciado: "", peso: 10 };

  switch (tipo) {
    case "vf_fundamentada":
      return { ...base, tipo, respuesta_correcta: true, min_caracteres_fundamentacion: 50 };
    case "opcion_unica":
      return { ...base, tipo, opciones: ["", ""], respuesta_correcta: 0, retroalimentacion: "" };
    case "opcion_multiple":
      return { ...base, tipo, opciones: ["", ""], respuestas_correctas: [], puntuacion: "proporcional" };
    case "abierta":
      return { ...base, tipo };
    case "entrega_tp":
      return { ...base, tipo, tipos_entrega: ["archivo"] };
  }
}

export type MostrarResultado = "inmediato" | "diferido";

export interface EvaluationConfig {
  tiempo_limite_min: number | null;
  intentos_permitidos: number;
  espera_horas: number;
  mostrar_resultado: MostrarResultado;
}

export const DEFAULT_EVALUATION_CONFIG: EvaluationConfig = {
  tiempo_limite_min: null,
  intentos_permitidos: 1,
  espera_horas: 24,
  mostrar_resultado: "inmediato",
};

export interface EvaluationSummary {
  id: string;
  titulo: string;
  tipo: EvaluationTipo;
  module_id: string | null;
}

export interface EditableEvaluation {
  id: string;
  titulo: string;
  tipo: EvaluationTipo;
  course_id: string;
  module_id: string | null;
  preguntas: EvaluationQuestion[];
  nota_minima: number;
  config: EvaluationConfig;
}
