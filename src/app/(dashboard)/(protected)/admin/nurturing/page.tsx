import Link from "next/link";

import { NotificationBanner } from "@/components/ui/notification-banner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { nurturingEmailContent, NURTURING_MILESTONES } from "@/modules/comunicacion/nurturing";

/**
 * Vista admin de la secuencia de nurturing (días 1 / 3 / 7).
 * El copy vive en código (`nurturingEmailContent`) — editar ahí o pedir
 * revisión de copy antes de prender FEATURE_PUBLICA / talleres masivos.
 * Editable en DB queda como mejora post go-live.
 */
export default function AdminNurturingPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <PageHeader
        title="Nurturing post-taller"
        description="Secuencia automática por email a leads (días 1, 3 y 7). Disparada por /api/cron/nurturing."
      />

      <NotificationBanner type="info">
        El copy está documentado acá para revisión. Para cambiarlo, editá{" "}
        <code className="text-caption">src/modules/comunicacion/nurturing.ts</code> y redeployá.
        El cron respeta los flags <code className="text-caption">nurturing_d*_enviado</code> (idempotente).
      </NotificationBanner>

      <div className="flex flex-col gap-3">
        {NURTURING_MILESTONES.map(({ dias }) => {
          const sample = nurturingEmailContent(dias, "María");
          return (
            <Card key={dias} className="flex flex-col gap-2 p-4">
              <p className="text-section font-semibold text-white">Día {dias}</p>
              <p className="text-caption text-[--edu-text-muted]">Asunto</p>
              <p className="text-body text-white">{sample.subject}</p>
              <p className="text-caption text-[--edu-text-muted]">Cuerpo (HTML)</p>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-[10px] bg-[--edu-surface-alt] p-3 text-caption text-[--edu-text]">
                {sample.html}
              </pre>
            </Card>
          );
        })}
      </div>

      <p className="text-body text-[--edu-text-muted]">
        Flags de módulo:{" "}
        <Link href="/admin/configuracion" className="text-[--inc-violet-text] hover:underline">
          /admin/configuracion
        </Link>
        . Cron preview: ver <code className="text-caption">docs/qa/crons-preview.md</code>.
      </p>
    </div>
  );
}
