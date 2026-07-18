import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AsistenciaPanel, type AlumnoAsistencia } from "@/components/docente/AsistenciaPanel";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { TUTORIA_ESTADO_LABEL, type TutoriaEstado } from "@/modules/tutorias/tutorias";
import { createClient } from "@/lib/supabase/server";

const ESTADO_BADGE: Record<TutoriaEstado, NonNullable<BadgeProps["state"]>> = {
  programada: "active",
  realizada: "completed",
  cancelada: "locked",
};

export default async function DocenteTutoriaDetailPage({
  params,
}: {
  params: { id: string; tutoriaId: string };
}) {
  const supabase = await createClient();

  const { data: tutoria } = await supabase
    .from("tutorias")
    .select("id, curso_id, modalidad, fecha_inicio, estado, grabacion_url, courses(titulo)")
    .eq("id", params.tutoriaId)
    .single();

  if (!tutoria) {
    notFound();
  }

  const cursoTitulo = (tutoria.courses as unknown as { titulo: string } | null)?.titulo ?? "Curso";

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("user_id, users(nombre, apellido)")
    .eq("course_id", params.id);

  const { data: asistencias } = await supabase
    .from("tutoria_asistencias")
    .select("alumno_id, presente")
    .eq("tutoria_id", params.tutoriaId);

  const presenteByAlumno = new Map((asistencias ?? []).map((a) => [a.alumno_id as string, a.presente as boolean]));

  const alumnos: AlumnoAsistencia[] = (enrollments ?? []).map((e) => {
    const alumno = e.users as unknown as { nombre: string; apellido: string } | null;
    return {
      alumnoId: e.user_id as string,
      nombre: alumno ? `${alumno.nombre} ${alumno.apellido}` : "Alumno",
      presente: presenteByAlumno.get(e.user_id as string) ?? false,
    };
  });

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Link
        href={`/docente/cursos/${params.id}/tutorias`}
        className="flex w-fit items-center gap-1 text-[13px] text-[--edu-text-muted] hover:text-[--edu-text]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a Tutorías
      </Link>

      <div className="flex items-center gap-2">
        <h1 className="text-[20px] font-semibold text-white">Tutoría — {cursoTitulo}</h1>
        <Badge state={ESTADO_BADGE[tutoria.estado as TutoriaEstado]}>
          {TUTORIA_ESTADO_LABEL[tutoria.estado as TutoriaEstado]}
        </Badge>
      </div>
      <p className="text-[13px] text-[--edu-text-muted]">
        {new Date(tutoria.fecha_inicio).toLocaleString("es-AR", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        · {tutoria.modalidad === "virtual" ? "Virtual" : "Presencial"}
      </p>

      <AsistenciaPanel
        tutoriaId={tutoria.id}
        cursoId={params.id}
        alumnos={alumnos}
        grabacionUrl={tutoria.grabacion_url}
        puedeRegistrar={tutoria.estado !== "programada"}
      />
    </div>
  );
}
