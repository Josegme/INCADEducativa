import { describe, expect, it } from "vitest";

import { puedePublicarEnCarrera, puedeVerPublicacion } from "@/modules/comunidad/foro";

describe("puedePublicarEnCarrera", () => {
  it("feed institucional (carreraId null) — cualquier autenticado puede publicar", () => {
    expect(puedePublicarEnCarrera({ id: "u1", carreraId: null, isAdmin: false }, null)).toBe(true);
    expect(puedePublicarEnCarrera({ id: "u1", carreraId: "c1", isAdmin: false }, null)).toBe(true);
  });

  it("foro de carrera — solo un miembro de esa carrera puede publicar", () => {
    expect(puedePublicarEnCarrera({ id: "u1", carreraId: "c1", isAdmin: false }, "c1")).toBe(true);
    expect(puedePublicarEnCarrera({ id: "u1", carreraId: "c2", isAdmin: false }, "c1")).toBe(false);
    expect(puedePublicarEnCarrera({ id: "u1", carreraId: null, isAdmin: false }, "c1")).toBe(false);
  });

  it("Admin puede publicar en cualquier carrera aunque no pertenezca", () => {
    expect(puedePublicarEnCarrera({ id: "admin1", carreraId: null, isAdmin: true }, "c1")).toBe(true);
  });
});

describe("puedeVerPublicacion", () => {
  it("sin sesión (viewerId null) — nunca ve nada", () => {
    expect(puedeVerPublicacion({ autorId: "u1", oculto: false }, null, false)).toBe(false);
  });

  it("publicación no oculta — cualquier autenticado la ve", () => {
    expect(puedeVerPublicacion({ autorId: "u1", oculto: false }, "u2", false)).toBe(true);
  });

  it("publicación oculta — solo el autor o el Admin la ven", () => {
    expect(puedeVerPublicacion({ autorId: "u1", oculto: true }, "u1", false)).toBe(true);
    expect(puedeVerPublicacion({ autorId: "u1", oculto: true }, "admin1", true)).toBe(true);
    expect(puedeVerPublicacion({ autorId: "u1", oculto: true }, "u2", false)).toBe(false);
  });
});
