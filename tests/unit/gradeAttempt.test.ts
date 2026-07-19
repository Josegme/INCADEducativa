import { describe, expect, it } from "vitest";

import { gradeAttempt } from "@/modules/educativa/evaluationAttempt";
import type {
  QuestionAbierta,
  QuestionEntregaTp,
  QuestionOpcionMultiple,
  QuestionOpcionUnica,
  QuestionVF,
} from "@/modules/docente/evaluationEditor";

describe("gradeAttempt", () => {
  it("opcion_unica: suma el peso completo si acierta, 0 si no", () => {
    const question: QuestionOpcionUnica = {
      id: "q1",
      tipo: "opcion_unica",
      enunciado: "¿?",
      peso: 40,
      opciones: ["a", "b"],
      respuesta_correcta: 1,
      retroalimentacion: "",
    };

    const correcto = gradeAttempt([question], { q1: { seleccionada: 1 } });
    expect(correcto).toEqual({ scoreAuto: 40, needsManualReview: false, pesoManualDisponible: 0 });

    const incorrecto = gradeAttempt([question], { q1: { seleccionada: 0 } });
    expect(incorrecto.scoreAuto).toBe(0);
    expect(incorrecto.needsManualReview).toBe(false);
  });

  it("opcion_multiple todo_o_nada: exige el set exacto", () => {
    const question: QuestionOpcionMultiple = {
      id: "q1",
      tipo: "opcion_multiple",
      enunciado: "¿?",
      peso: 30,
      opciones: ["a", "b", "c"],
      respuestas_correctas: [0, 2],
      puntuacion: "todo_o_nada",
    };

    expect(gradeAttempt([question], { q1: { seleccionadas: [0, 2] } }).scoreAuto).toBe(30);
    expect(gradeAttempt([question], { q1: { seleccionadas: [2, 0] } }).scoreAuto).toBe(30);
    expect(gradeAttempt([question], { q1: { seleccionadas: [0] } }).scoreAuto).toBe(0);
    expect(gradeAttempt([question], { q1: { seleccionadas: [0, 1, 2] } }).scoreAuto).toBe(0);
  });

  it("opcion_multiple proporcional: reparte el peso según aciertos", () => {
    const question: QuestionOpcionMultiple = {
      id: "q1",
      tipo: "opcion_multiple",
      enunciado: "¿?",
      peso: 20,
      opciones: ["a", "b", "c", "d"],
      respuestas_correctas: [0, 1],
      puntuacion: "proporcional",
    };

    expect(gradeAttempt([question], { q1: { seleccionadas: [0, 1] } }).scoreAuto).toBe(20);
    expect(gradeAttempt([question], { q1: { seleccionadas: [0] } }).scoreAuto).toBe(10);
    expect(gradeAttempt([question], { q1: { seleccionadas: [0, 3] } }).scoreAuto).toBe(10);
    expect(gradeAttempt([question], { q1: { seleccionadas: [3] } }).scoreAuto).toBe(0);
  });

  it("vf_fundamentada: reparte 50/50 auto/manual y siempre pide revisión", () => {
    const question: QuestionVF = {
      id: "q1",
      tipo: "vf_fundamentada",
      enunciado: "¿?",
      peso: 20,
      respuesta_correcta: true,
      min_caracteres_fundamentacion: 10,
    };

    const correcto = gradeAttempt([question], { q1: { respuesta: true, fundamentacion: "porque sí" } });
    expect(correcto).toEqual({ scoreAuto: 10, needsManualReview: true, pesoManualDisponible: 10 });

    const incorrecto = gradeAttempt([question], { q1: { respuesta: false, fundamentacion: "porque no" } });
    expect(incorrecto).toEqual({ scoreAuto: 0, needsManualReview: true, pesoManualDisponible: 10 });
  });

  it("abierta y entrega_tp: 0 auto, 100% del peso queda para corrección manual", () => {
    const abierta: QuestionAbierta = { id: "q1", tipo: "abierta", enunciado: "¿?", peso: 25 };
    const tp: QuestionEntregaTp = {
      id: "q2",
      tipo: "entrega_tp",
      enunciado: "Entregá el TP",
      peso: 35,
      tipos_entrega: ["archivo"],
    };

    const result = gradeAttempt([abierta, tp], {
      q1: { texto: "una respuesta larga" },
      q2: { tipoEntrega: "archivo", valor: "path/al/archivo.pdf" },
    });

    expect(result).toEqual({ scoreAuto: 0, needsManualReview: true, pesoManualDisponible: 60 });
  });

  it("combina varios tipos y nunca supera 100 en scoreAuto", () => {
    const q1: QuestionOpcionUnica = {
      id: "q1",
      tipo: "opcion_unica",
      enunciado: "¿?",
      peso: 80,
      opciones: ["a", "b"],
      respuesta_correcta: 0,
      retroalimentacion: "",
    };
    const q2: QuestionOpcionUnica = {
      id: "q2",
      tipo: "opcion_unica",
      enunciado: "¿?",
      peso: 80,
      opciones: ["a", "b"],
      respuesta_correcta: 0,
      retroalimentacion: "",
    };

    const result = gradeAttempt([q1, q2], {
      q1: { seleccionada: 0 },
      q2: { seleccionada: 0 },
    });

    expect(result.scoreAuto).toBe(100);
  });

  it("sin respuesta para una pregunta: no rompe, cuenta como incorrecta/vacía", () => {
    const question: QuestionOpcionUnica = {
      id: "q1",
      tipo: "opcion_unica",
      enunciado: "¿?",
      peso: 50,
      opciones: ["a", "b"],
      respuesta_correcta: 0,
      retroalimentacion: "",
    };

    const result = gradeAttempt([question], {});
    expect(result.scoreAuto).toBe(0);
    expect(result.needsManualReview).toBe(false);
  });
});
