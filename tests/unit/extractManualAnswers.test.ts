import { describe, expect, it } from "vitest";

import { extractManualAnswers } from "@/modules/educativa/evaluationAttempt";
import type { QuestionVF } from "@/modules/docente/evaluationEditor";

describe("extractManualAnswers", () => {
  const question: QuestionVF = {
    id: "q1",
    tipo: "vf_fundamentada",
    enunciado: "¿?",
    peso: 20,
    respuesta_correcta: true,
    min_caracteres_fundamentacion: 10,
  };

  it("vf_fundamentada sin responder: no se confunde con 'Falso'", () => {
    const [result] = extractManualAnswers([question], { q1: { respuesta: null, fundamentacion: "" } });
    expect(result.tipoLabel).toBe("V/F: Sin responder");
  });

  it("vf_fundamentada respondida false: se muestra como 'Falso'", () => {
    const [result] = extractManualAnswers([question], { q1: { respuesta: false, fundamentacion: "porque no" } });
    expect(result.tipoLabel).toBe("V/F: Falso");
  });

  it("vf_fundamentada respondida true: se muestra como 'Verdadero'", () => {
    const [result] = extractManualAnswers([question], { q1: { respuesta: true, fundamentacion: "porque sí" } });
    expect(result.tipoLabel).toBe("V/F: Verdadero");
  });
});
