import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { TutoriaModal } from "@/components/docente/TutoriaModal";
import { TutoriaList, type DocenteTutoriaRow } from "@/components/docente/TutoriaList";
import { flags } from "@/lib/flags";
import { createClient } from "@/lib/supabase/server";

export default async function DocenteTutoriasPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("id, titulo").eq("id", params.id).single();

  if (!course) {
    notFound();
  }

  const { data: rows } = await supabase
    .from("tutorias")
    .select("id, modalidad, fecha_inicio, estado, space:spaces(nombre)")
    .eq("curso_id", params.id)
    .order("fecha_inicio", { ascending: false });

  const tutorias: DocenteTutoriaRow[] = (rows ?? []).map((row) => ({
    id: row.id as string,
    modalidad: row.modalidad as DocenteTutoriaRow["modalidad"],
    fecha_inicio: row.fecha_inicio as string,
    estado: row.estado as DocenteTutoriaRow["estado"],
    aula_nombre: (row.space as unknown as { nombre: string } | null)?.nombre ?? null,
  }));

  const { data: aulas } = flags.coworking
    ? await supabase.from("spaces").select("id, nombre").eq("tipo", "aula").eq("activo", true)
    : { data: [] };

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Link
        href={`/docente/cursos/${course.id}`}
        className="flex w-fit items-center gap-1 text-[13px] text-[--edu-text-muted] hover:text-[--edu-text]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a {course.titulo}
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-white">Tutorías — {course.titulo}</h1>
        <TutoriaModal cursoId={course.id} aulas={aulas ?? []} coworkingHabilitado={flags.coworking} />
      </div>

      <TutoriaList cursoId={course.id} tutorias={tutorias} />
    </div>
  );
}
