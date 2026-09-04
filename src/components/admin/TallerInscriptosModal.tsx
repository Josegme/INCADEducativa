"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { marcarAsistenciaTallerAction } from "@/app/(dashboard)/(protected)/admin/actions/tallerActions";

interface InscriptoRow {
  id: string;
  nombre: string;
  apellido: string;
  asistio: boolean;
}

interface TallerInscriptosModalProps {
  tallerTitulo: string;
  inscriptos: InscriptoRow[];
}

export function TallerInscriptosModal({ tallerTitulo, inscriptos }: TallerInscriptosModalProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleToggle(inscripcionId: string, asistio: boolean) {
    setPendingId(inscripcionId);
    setError(null);

    const result = await marcarAsistenciaTallerAction(inscripcionId, asistio);

    setPendingId(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Ver inscriptos">
          <Users className="h-4 w-4" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inscriptos — {tallerTitulo}</DialogTitle>
          <DialogDescription>
            Marcá quién asistió después del taller — otorga 20 puntos automáticamente la primera vez.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        {inscriptos.length === 0 ? (
          <p className="text-[13px] text-[--edu-text-muted]">Todavía no hay nadie inscripto.</p>
        ) : (
          <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto rounded-md border-[0.5px] border-[--edu-border] p-2">
            {inscriptos.map((i) => (
              <label key={i.id} className="flex items-center gap-2 text-[13px] text-[--edu-text]">
                <input
                  type="checkbox"
                  checked={i.asistio}
                  disabled={pendingId === i.id}
                  onChange={(e) => handleToggle(i.id, e.target.checked)}
                  className="h-4 w-4 rounded-sm border-[--edu-border] accent-[--inc-violet]"
                />
                {i.nombre} {i.apellido}
              </label>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
