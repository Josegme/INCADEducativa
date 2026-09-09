import { describe, expect, it } from "vitest";

import { NURTURING_MILESTONES, isNurturingDue, nurturingEmailContent } from "@/modules/comunicacion/nurturing";

describe("isNurturingDue", () => {
  const createdAt = new Date("2026-01-01T00:00:00Z");

  it("no está due antes de que pase el umbral", () => {
    const justBefore = new Date("2026-01-01T23:59:59Z");
    expect(isNurturingDue(createdAt, 1, justBefore)).toBe(false);
  });

  it("está due justo al cumplirse N días", () => {
    const exact = new Date("2026-01-02T00:00:00Z");
    expect(isNurturingDue(createdAt, 1, exact)).toBe(true);
  });

  it("sigue due mucho después del umbral (cron caído varios días)", () => {
    const wayLater = new Date("2026-01-20T00:00:00Z");
    expect(isNurturingDue(createdAt, 3, wayLater)).toBe(true);
    expect(isNurturingDue(createdAt, 7, wayLater)).toBe(true);
  });

  it("día 7 no está due si todavía no pasaron 7 días aunque ya haya pasado el día 3", () => {
    const day5 = new Date("2026-01-06T00:00:00Z");
    expect(isNurturingDue(createdAt, 3, day5)).toBe(true);
    expect(isNurturingDue(createdAt, 7, day5)).toBe(false);
  });
});

describe("NURTURING_MILESTONES", () => {
  it("tiene exactamente 3 milestones en orden ascendente d1/d3/d7", () => {
    expect(NURTURING_MILESTONES.map((m) => m.dias)).toEqual([1, 3, 7]);
  });

  it("cada milestone tiene una flagColumn distinta", () => {
    const columns = new Set(NURTURING_MILESTONES.map((m) => m.flagColumn));
    expect(columns.size).toBe(3);
  });
});

describe("nurturingEmailContent", () => {
  it("genera un subject y html no vacíos para cada día", () => {
    for (const dias of [1, 3, 7] as const) {
      const { subject, html } = nurturingEmailContent(dias, "Ana");
      expect(subject.length).toBeGreaterThan(0);
      expect(html).toContain("Ana");
    }
  });

  it("saluda genérico si no hay nombre", () => {
    const { html } = nurturingEmailContent(1, "");
    expect(html).toContain("Hola,");
  });
});
