"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TutoriaEstado, TutoriaModalidad } from "@/modules/tutorias/tutorias";
import { TUTORIA_ESTADO_LABEL } from "@/modules/tutorias/tutorias";
import { cancelTutoriaAction } from "@/app/(dashboard)/docente/actions/tutoriaActions";

const ESTADO_BADGE: Record<TutoriaEstado, NonNullable<BadgeProps["state"]>> = {
  programada: "active",
  realizada: "completed",
  cancelada: "locked",
};

export interface DocenteTutoriaRow {
  id: string;
  modalidad: TutoriaModalidad;
  fecha_inicio: string;
  estado: TutoriaEstado;
  aula_nombre: string | null;
}

interface TutoriaListProps {
  cursoId: string;
  tutorias: DocenteTutoriaRow[];
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function TutoriaList({ cursoId, tutorias }: TutoriaListProps) {
  const router = useRouter();
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);

  async function handleCancel(tutoriaId: string) {
    setCancellingId(tutoriaId);
    await cancelTutoriaAction(tutoriaId, cursoId);
    setCancellingId(null);
    router.refresh();
  }

  if (tutorias.length === 0) {
    return <p className="text-[13px] text-[--edu-text-muted]">Todavía no hay tutorías programadas.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {tutorias.map((tutoria) => (
        <div
          key={tutoria.id}
          className="flex items-center justify-between rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-white">{formatFecha(tutoria.fecha_inicio)}</span>
              <Badge state={ESTADO_BADGE[tutoria.estado]}>{TUTORIA_ESTADO_LABEL[tutoria.estado]}</Badge>
            </div>
            <span className="text-[12px] text-[--edu-text-muted]">
              {tutoria.modalidad === "virtual" ? "Virtual" : `Presencial — ${tutoria.aula_nombre ?? "aula"}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/docente/cursos/${cursoId}/tutorias/${tutoria.id}`}>
              <Button variant="ghost" size="sm">
                Ver detalle
              </Button>
            </Link>
            {tutoria.estado === "programada" ? (
              <Button
                variant="outline"
                size="sm"
                disabled={cancellingId === tutoria.id}
                onClick={() => handleCancel(tutoria.id)}
              >
                {cancellingId === tutoria.id ? "Cancelando…" : "Cancelar"}
              </Button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
