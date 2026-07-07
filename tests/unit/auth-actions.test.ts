import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted() se evalúa junto con los vi.mock() de abajo (que Vitest sube
// al tope del archivo), así evitamos el "Cannot access before initialization"
// que da usar variables `const` normales dentro de un factory hoisteado.
const { mockSignInWithPassword, mockResetPasswordForEmail, mockRedirect } = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockResetPasswordForEmail: vi.fn(),
  mockRedirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

import { loginAction } from "@/app/(auth)/actions/loginAction";
import { requestPasswordResetAction } from "@/app/(auth)/actions/requestPasswordResetAction";

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

describe("loginAction", () => {
  beforeEach(() => {
    mockSignInWithPassword.mockReset();
    mockRedirect.mockClear();
  });

  it("redirige a /dashboard con credenciales correctas", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    await expect(
      loginAction(formData({ email: "alumno@incade.edu.ar", password: "password123" }))
    ).rejects.toThrow("REDIRECT:/dashboard");

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "alumno@incade.edu.ar",
      password: "password123",
    });
  });

  it("devuelve error genérico con credenciales inválidas", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    const result = await loginAction(
      formData({ email: "alumno@incade.edu.ar", password: "incorrecta" })
    );

    expect(result.error).toBe("Email o contraseña incorrectos");
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("devuelve error de validación si el email no es válido, sin llamar a Supabase", async () => {
    const result = await loginAction(formData({ email: "no-es-un-email", password: "algo" }));

    expect(result.error).toBeDefined();
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });
});

describe("requestPasswordResetAction", () => {
  beforeEach(() => {
    mockResetPasswordForEmail.mockReset();
  });

  it("responde éxito cuando el email tiene formato válido", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    const result = await requestPasswordResetAction(
      formData({ email: "alumno@incade.edu.ar" })
    );

    expect(result.success).toBe(true);
    expect(mockResetPasswordForEmail).toHaveBeenCalledTimes(1);
  });

  it("responde éxito aunque el email no exista, para no filtrar información", async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: "User not found" },
    });

    const result = await requestPasswordResetAction(
      formData({ email: "no-existe@incade.edu.ar" })
    );

    expect(result.success).toBe(true);
  });

  it("devuelve error de validación con un email inválido, sin llamar a Supabase", async () => {
    const result = await requestPasswordResetAction(formData({ email: "no-es-un-email" }));

    expect(result.error).toBeDefined();
    expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
  });
});
