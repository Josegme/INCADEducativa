import { NextRequest, NextResponse } from "next/server";

import { notifyUsers } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { NURTURING_MILESTONES, isNurturingDue, nurturingEmailContent } from "@/modules/comunicacion/nurturing";

/**
 * Disparado por pg_cron + pg_net (migración 037) cada hora, o a mano con
 * curl mientras no haya deploy (pg_net no puede alcanzar localhost) — mismo
 * patrón que /api/cron/coworking y /api/cron/tutorias. Secuencia de
 * nurturing post-taller gratuito (T12, `resolver_loop1.md`): días 1, 3 y 7
 * desde el alta como `lead`, in-app + email vía notifyUsers.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();

  const sentByMilestone: Record<number, number> = {};

  for (const { dias, flagColumn } of NURTURING_MILESTONES) {
    const { data: candidateLeads } = await admin
      .from("users")
      .select("id, email, nombre, created_at")
      .eq("role", "lead")
      .eq(flagColumn, false);

    let sent = 0;
    for (const lead of candidateLeads ?? []) {
      if (!isNurturingDue(new Date(lead.created_at as string), dias, now)) continue;
      if (!lead.email) continue;

      const { subject, html } = nurturingEmailContent(dias, (lead.nombre as string) ?? "");

      await notifyUsers(admin, {
        tipo: "sistema",
        referenciaId: lead.id as string,
        titulo: subject,
        cuerpo: html,
        recipients: [{ userId: lead.id as string, email: lead.email as string, emailHtml: html }],
        emailSubject: subject,
      });

      await admin.from("users").update({ [flagColumn]: true }).eq("id", lead.id as string);
      sent++;
    }

    sentByMilestone[dias] = sent;
  }

  return NextResponse.json({ sentByMilestone });
}
