"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { regenerateCertificatePdf } from "@/lib/certificates";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    throw new Error("Solo el administrador puede gestionar certificados");
  }

  return { supabase, adminId: user.id };
}

export interface CertificateActionState {
  error?: string;
  success?: boolean;
}

export async function updateCertificateNameAction(
  certificateId: string,
  nombreOverride: string
): Promise<CertificateActionState> {
  const { supabase, adminId } = await requireAdmin();

  const { error } = await supabase
    .from("certificates")
    .update({ nombre_override: nombreOverride.trim() || null })
    .eq("id", certificateId);

  if (error) {
    return { error: error.message };
  }

  const regenerateResult = await regenerateCertificatePdf(certificateId);
  if (regenerateResult.error) {
    return { error: regenerateResult.error };
  }

  await logAudit({
    actorId: adminId,
    accion: "certificado.editar_nombre",
    entidad: "certificates",
    entidadId: certificateId,
    detalle: { nombreOverride: nombreOverride.trim() || null },
  });

  revalidatePath("/admin/certificados");
  return { success: true };
}

export async function regenerateCertificateAction(certificateId: string): Promise<CertificateActionState> {
  const { adminId } = await requireAdmin();

  const result = await regenerateCertificatePdf(certificateId);
  if (result.error) {
    return { error: result.error };
  }

  await logAudit({
    actorId: adminId,
    accion: "certificado.regenerar",
    entidad: "certificates",
    entidadId: certificateId,
  });

  revalidatePath("/admin/certificados");
  return { success: true };
}
