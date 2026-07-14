import type { EvaluationQuestion, SubmissionKind } from "@/modules/docente/evaluationEditor";

export type AttemptState =
  | "bloqueada"
  | "disponible"
  | "en_curso"
  | "pendiente_correccion"
  | "aprobada"
  | "desaprobada"
  | "corregida";

export const ATTEMPT_STATE_LABEL: Record<AttemptState, string> = {
  bloqueada: "Bloqueada",
  disponible: "Disponible",
  en_curso: "En curso",
  pendiente_correccion: "Pendiente de corrección",
  aprobada: "Aprobada",
  desaprobada: "Desaprobada",
  corregida: "Corregida",
};

export interface AnswerVF {
  respuesta: boolean;
  fundamentacion: string;
}

export interface AnswerOpcionUnica {
  seleccionada: number | null;
}

export interface AnswerOpcionMultiple {
  seleccionadas: number[];
}

export interface AnswerAbierta {
  texto: string;
}

export interface AnswerEntregaTp {
  tipoEntrega: SubmissionKind;
  valor: string;
}

export type AnswerValue = AnswerVF | AnswerOpcionUnica | AnswerOpcionMultiple | AnswerAbierta | AnswerEntregaTp;

export type Respuestas = Record<string, AnswerValue>;

export function createEmptyAnswer(question: EvaluationQuestion): AnswerValue {
  switch (question.tipo) {
    case "vf_fundamentada":
      return { respuesta: true, fundamentacion: "" };
    case "opcion_unica":
      return { seleccionada: null };
    case "opcion_multiple":
      return { seleccionadas: [] };
    case "abierta":
      return { texto: "" };
    case "entrega_tp":
      return { tipoEntrega: question.tipos_entrega[0], valor: "" };
  }
}

export interface GradingResult {
  scoreAuto: number;
  needsManualReview: boolean;
  pesoManualDisponible: number;
}

/** Corrección automática — opción única/múltiple. El resto (V/F fundamentado,
 * abierta, entrega de TP) siempre requiere revisión manual del docente. */
export function gradeAttempt(preguntas: EvaluationQuestion[], respuestas: Respuestas): GradingResult {
  let scoreAuto = 0;
  let pesoManualDisponible = 0;
  let needsManualReview = false;

  for (const question of preguntas) {
    const answer = respuestas[question.id];

    if (question.tipo === "opcion_unica") {
      const a = answer as AnswerOpcionUnica | undefined;
      if (a?.seleccionada === question.respuesta_correcta) {
        scoreAuto += question.peso;
      }
      continue;
    }

    if (question.tipo === "opcion_multiple") {
      const a = answer as AnswerOpcionMultiple | undefined;
      const seleccionadas = a?.seleccionadas ?? [];
      const correctas = question.respuestas_correctas;

      if (question.puntuacion === "todo_o_nada") {
        const iguales =
          seleccionadas.length === correctas.length && seleccionadas.every((v) => correctas.includes(v));
        if (iguales) scoreAuto += question.peso;
      } else if (correctas.length > 0) {
        const acertadas = seleccionadas.filter((v) => correctas.includes(v)).length;
        scoreAuto += question.peso * (acertadas / correctas.length);
      }
      continue;
    }

    if (question.tipo === "vf_fundamentada") {
      const a = answer as AnswerVF | undefined;
      if (a?.respuesta === question.respuesta_correcta) {
        scoreAuto += question.peso / 2;
      }
      pesoManualDisponible += question.peso / 2;
      needsManualReview = true;
      continue;
    }

    // abierta / entrega_tp: 100% manual
    pesoManualDisponible += question.peso;
    needsManualReview = true;
  }

  return {
    scoreAuto: Math.min(100, Math.round(scoreAuto)),
    needsManualReview,
    pesoManualDisponible: Math.round(pesoManualDisponible),
  };
}

export interface ManualAnswerDisplay {
  questionId: string;
  enunciado: string;
  tipoLabel: string;
  texto?: string;
  link?: string;
}

/** Extrae para el panel de correcciones solo las respuestas de preguntas que
 * requieren revisión manual (V/F fundamentado, abierta, entrega de TP). */
export function extractManualAnswers(preguntas: EvaluationQuestion[], respuestas: Respuestas): ManualAnswerDisplay[] {
  const result: ManualAnswerDisplay[] = [];

  for (const question of preguntas) {
    const answer = respuestas[question.id];
    if (!answer) continue;

    if (question.tipo === "vf_fundamentada") {
      const a = answer as AnswerVF;
      result.push({
        questionId: question.id,
        enunciado: question.enunciado,
        tipoLabel: `V/F: ${a.respuesta ? "Verdadero" : "Falso"}`,
        texto: a.fundamentacion,
      });
    } else if (question.tipo === "abierta") {
      const a = answer as AnswerAbierta;
      result.push({ questionId: question.id, enunciado: question.enunciado, tipoLabel: "Respuesta abierta", texto: a.texto });
    } else if (question.tipo === "entrega_tp") {
      const a = answer as AnswerEntregaTp;
      const isLink = a.tipoEntrega !== "texto";
      result.push({
        questionId: question.id,
        enunciado: question.enunciado,
        tipoLabel: `Entrega (${a.tipoEntrega})`,
        texto: isLink ? undefined : a.valor,
        link: isLink ? a.valor : undefined,
      });
    }
  }

  return result;
}

export interface AttemptRow {
  id: string;
  user_id: string;
  evaluation_id: string;
  respuestas: Respuestas;
  nota: number | null;
  aprobado: boolean | null;
  intento_num: number;
  estado: AttemptState;
  score_auto: number | null;
  score_manual: number | null;
  created_at: string;
}
