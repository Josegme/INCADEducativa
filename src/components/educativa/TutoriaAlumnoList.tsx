import { Video, MapPin, PlayCircle } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { TUTORIA_ESTADO_LABEL, type TutoriaEstado, type TutoriaModalidad } from "@/modules/tutorias/tutorias";

const ESTADO_BADGE: Record<TutoriaEstado, NonNullable<BadgeProps["state"]>> = {
  programada: "active",
  realizada: "completed",
  cancelada: "locked",
};

export interface AlumnoTutoriaRow {
  id: string;
  modalidad: TutoriaModalidad;
  fecha_inicio: string;
  estado: TutoriaEstado;
  link_virtual: string | null;
  grabacion_url: string | null;
  aula_nombre: string | null;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function TutoriaAlumnoList({ tutorias }: { tutorias: AlumnoTutoriaRow[] }) {
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
            <span className="flex items-center gap-1 text-[12px] text-[--edu-text-muted]">
              {tutoria.modalidad === "virtual" ? (
                <>
                  <Video className="h-3.5 w-3.5" aria-hidden /> Virtual
                </>
              ) : (
                <>
                  <MapPin className="h-3.5 w-3.5" aria-hidden /> {tutoria.aula_nombre ?? "Aula presencial"}
                </>
              )}
            </span>
          </div>

          {tutoria.estado === "programada" && tutoria.modalidad === "virtual" && tutoria.link_virtual ? (
            <a
              href={tutoria.link_virtual}
              target="_blank"
              rel="noreferrer"
              className="text-[13px] font-medium text-[--inc-violet] hover:underline"
            >
              Unirse
            </a>
          ) : null}

          {tutoria.estado === "realizada" && tutoria.grabacion_url ? (
            <a
              href={tutoria.grabacion_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[13px] font-medium text-[--inc-violet] hover:underline"
            >
              <PlayCircle className="h-4 w-4" aria-hidden />
              Ver grabación
            </a>
          ) : null}
        </div>
      ))}
    </div>
  );
}
