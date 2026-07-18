"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PlayCircle, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TallerRow } from "@/modules/talleres/talleres";
import { desinscribirseTallerAction, inscribirseTallerAction } from "@/app/(dashboard)/actions/tallerInscripcionActions";

interface TallerCardProps {
  taller: TallerRow;
  inscripto: boolean;
  cantidadInscriptos: number;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function TallerCard({ taller, inscripto, cantidadInscriptos }: TallerCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const lleno = taller.capacidad !== null && cantidadInscriptos >= taller.capacidad;
  const yaOcurrio = new Date(taller.fecha_inicio).getTime() + taller.duracion_minutos * 60 * 1000 < Date.now();

  async function handleToggle() {
    setIsLoading(true);
    setError(null);
    const result = inscripto ? await desinscribirseTallerAction(taller.id) : await inscribirseTallerAction(taller.id);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
      <div className="flex items-center gap-2">
        <span className="text-[14px] font-semibold text-white">{taller.titulo}</span>
        {inscripto ? <Badge state="completed">Inscripto</Badge> : null}
      </div>
      {taller.descripcion ? <p className="text-[13px] text-[--edu-text-muted]">{taller.descripcion}</p> : null}
      <span className="flex items-center gap-1 text-[12px] text-[--edu-text-muted]">
        <Video className="h-3.5 w-3.5" aria-hidden />
        {formatFecha(taller.fecha_inicio)} · {taller.duracion_minutos} min
      </span>

      {error ? <p className="text-[12px] text-[--edu-danger-text]">{error}</p> : null}

      {inscripto && !yaOcurrio && taller.link_virtual ? (
        <a href={taller.link_virtual} target="_blank" rel="noreferrer" className="text-[13px] font-medium text-[--inc-violet] hover:underline">
          Unirse
        </a>
      ) : null}

      {inscripto && yaOcurrio && taller.grabacion_url ? (
        <a
          href={taller.grabacion_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[13px] font-medium text-[--inc-violet] hover:underline"
        >
          <PlayCircle className="h-4 w-4" aria-hidden />
          Ver grabación
        </a>
      ) : null}

      {!yaOcurrio ? (
        <Button
          variant={inscripto ? "outline" : "primary"}
          size="sm"
          className="self-start"
          disabled={isLoading || (!inscripto && lleno)}
          onClick={handleToggle}
        >
          {isLoading ? "..." : inscripto ? "Desinscribirme" : lleno ? "Cupo lleno" : "Inscribirme"}
        </Button>
      ) : null}
    </div>
  );
}
