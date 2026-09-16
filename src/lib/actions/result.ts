export type FieldErrors = Record<string, string[]>;

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

export function ok(): ActionResult<undefined>;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data };
}

export function fail(error: string, fieldErrors?: FieldErrors): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/** Compatibilidad con formularios existentes que leen `{ error, success }`. */
export function toFormState(result: ActionResult<unknown>): { error?: string; success?: boolean } {
  if (result.ok) return { success: true };
  return { error: result.error };
}

export function fieldErrorsFromZod(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }): FieldErrors {
  const flattened = error.flatten().fieldErrors;
  const out: FieldErrors = {};
  for (const [key, value] of Object.entries(flattened)) {
    if (value && value.length > 0) out[key] = value;
  }
  return out;
}
