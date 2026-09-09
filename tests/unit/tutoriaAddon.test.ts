import { describe, expect, it } from "vitest";

import { grantsTutoriaAddonAccess, resolveTutoriaAddonEstado } from "@/modules/educativa/tutoriaAddon";

describe("resolveTutoriaAddonEstado", () => {
  it("approved → aprobado", () => {
    expect(resolveTutoriaAddonEstado("approved")).toBe("aprobado");
  });

  it("rejected → rechazado", () => {
    expect(resolveTutoriaAddonEstado("rejected")).toBe("rechazado");
  });

  it("cualquier otro status (pending, in_process, etc.) → pendiente", () => {
    expect(resolveTutoriaAddonEstado("pending")).toBe("pendiente");
    expect(resolveTutoriaAddonEstado("in_process")).toBe("pendiente");
    expect(resolveTutoriaAddonEstado("cancelled")).toBe("pendiente");
    expect(resolveTutoriaAddonEstado("")).toBe("pendiente");
  });
});

describe("grantsTutoriaAddonAccess — lógica de gracia del webhook", () => {
  it("aprobado → true (da acceso)", () => {
    expect(grantsTutoriaAddonAccess("aprobado")).toBe(true);
  });

  it("cualquier otro estado → false (sin acceso)", () => {
    expect(grantsTutoriaAddonAccess("pendiente")).toBe(false);
    expect(grantsTutoriaAddonAccess("rechazado")).toBe(false);
    expect(grantsTutoriaAddonAccess("reembolsado")).toBe(false);
  });

  it("compuesto: approved de MP siempre termina en acceso, el resto nunca", () => {
    for (const status of ["approved"]) {
      expect(grantsTutoriaAddonAccess(resolveTutoriaAddonEstado(status))).toBe(true);
    }
    for (const status of ["rejected", "pending", "in_process", "cancelled"]) {
      expect(grantsTutoriaAddonAccess(resolveTutoriaAddonEstado(status))).toBe(false);
    }
  });
});
