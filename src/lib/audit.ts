import { createAdminClient } from "@/lib/supabase/admin";

export interface AuditLogInput {
  actorId: string;
  accion: string;
  entidad: string;
  entidadId?: string | null;
  detalle?: Record<string, unknown> | null;
}

/**
 * Registra una acción en audit_log (tabla ya existente desde 001, columna
 * `user_id` — RLS `audit_admin` solo permite escribir a is_admin(), pero
 * varias acciones auditadas las dispara un docente sin ese rol. Usa el
 * cliente admin para bypassear RLS, mismo patrón que awardPoints()
 * (src/lib/points.ts) y checkAndIssueCertificate() (src/lib/certificates.ts)
 * — best-effort, nunca tira la acción del llamador si falla.
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin.from("audit_log").insert({
    user_id: input.actorId,
    accion: input.accion,
    entidad: input.entidad,
    entidad_id: input.entidadId ?? null,
    detalle: input.detalle ?? null,
  });

  if (error) {
    console.error("[audit] Error registrando acción:", input.accion, error);
  }
}
