"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBanner } from "@/components/ui/notification-banner";
import {
  cargarGrabacionAction,
  registrarAsistenciaAction,
} from "@/app/(dashboard)/docente/actions/tutoriaActions";

export interface AlumnoAsistencia {
  alumnoId: string;
  nombre: string;
  presente: boolean;
}

interface AsistenciaPanelProps {
  tutoriaId: string;
  cursoId: string;
  alumnos: AlumnoAsistencia[];
  grabacionUrl: string | null;
  puedeRegistrar: boolean;
}

export function AsistenciaPanel({ tutoriaId, cursoId, alumnos, grabacionUrl, puedeRegistrar }: AsistenciaPanelProps) {
  const router = useRouter();
  const [presentes, setPresentes] = React.useState<Record<string, boolean>>(
    Object.fromEntries(alumnos.map((a) => [a.alumnoId, a.presente]))
  );
  const [grabacion, setGrabacion] = React.useState(grabacionUrl ?? "");
  const [isSavingAsistencia, setIsSavingAsistencia] = React.useState(false);
  const [isSavingGrabacion, setIsSavingGrabacion] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function handleGuardarAsistencia() {
    setIsSavingAsistencia(true);
    setError(null);
    setSuccess(null);

    const result = await registrarAsistenciaAction(
      tutoriaId,
      cursoId,
      alumnos.map((a) => ({ alumnoId: a.alumnoId, presente: presentes[a.alumnoId] ?? false }))
    );

    setIsSavingAsistencia(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess("Asistencia guardada");
    router.refresh();
  }

  async function handleGuardarGrabacion(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingGrabacion(true);
    setError(null);
    setSuccess(null);

    const result = await cargarGrabacionAction(tutoriaId, cursoId, grabacion);

    setIsSavingGrabacion(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess("Grabación cargada");
    router.refresh();
  }

  if (!puedeRegistrar) {
    return (
      <p className="text-[13px] text-[--edu-text-muted]">
        La asistencia y la grabación se habilitan cuando la tutoría termina.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? <NotificationBanner type="danger">{error}</NotificationBanner> : null}
      {success ? <NotificationBanner type="success">{success}</NotificationBanner> : null}

      <div>
        <h2 className="mb-2 text-[14px] font-semibold text-white">Asistencia</h2>
        {alumnos.length === 0 ? (
          <p className="text-[13px] text-[--edu-text-muted]">No hay alumnos inscriptos en este curso.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {alumnos.map((alumno) => (
              <label key={alumno.alumnoId} className="flex items-center gap-2 text-[13px] text-[--edu-text]">
                <input
                  type="checkbox"
                  checked={presentes[alumno.alumnoId] ?? false}
                  onChange={(e) => setPresentes((prev) => ({ ...prev, [alumno.alumnoId]: e.target.checked }))}
                  className="h-4 w-4 rounded-sm border-[--edu-border] accent-[--inc-violet]"
                />
                {alumno.nombre}
              </label>
            ))}
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="mt-2 self-start"
              disabled={isSavingAsistencia}
              onClick={handleGuardarAsistencia}
            >
              {isSavingAsistencia ? "Guardando…" : "Guardar asistencia"}
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleGuardarGrabacion} className="flex flex-col gap-2">
        <h2 className="text-[14px] font-semibold text-white">Grabación</h2>
        <label htmlFor="grabacionUrl" className="text-[12px] font-medium text-[--edu-text-muted]">
          Link de la grabación (Drive/YouTube no listado)
        </label>
        <Input
          id="grabacionUrl"
          type="url"
          value={grabacion}
          onChange={(e) => setGrabacion(e.target.value)}
          placeholder="https://..."
        />
        <Button type="submit" variant="outline" size="sm" className="self-start" disabled={isSavingGrabacion}>
          {isSavingGrabacion ? "Guardando…" : "Guardar grabación"}
        </Button>
      </form>
    </div>
  );
}
