import { describe, expect, it } from "vitest";

import { fail, ok, toFormState } from "@/lib/actions/result";
import { SENA_DEFAULT_PCT } from "@/modules/coworking/booking";

describe("ActionResult", () => {
  it("ok() arma el contrato de éxito", () => {
    expect(ok({ id: "1" })).toEqual({ ok: true, data: { id: "1" } });
  });

  it("fail() incluye fieldErrors", () => {
    expect(fail("inválido", { email: ["requerido"] })).toEqual({
      ok: false,
      error: "inválido",
      fieldErrors: { email: ["requerido"] },
    });
  });

  it("toFormState traduce al shape legado", () => {
    expect(toFormState(ok())).toEqual({ success: true });
    expect(toFormState(fail("x"))).toEqual({ error: "x" });
  });
});

describe("seña coworking", () => {
  it("usa 30% por defecto", () => {
    expect(SENA_DEFAULT_PCT).toBe(30);
    expect(Math.round(1000 * (SENA_DEFAULT_PCT / 100))).toBe(300);
  });
});
