import Link from "next/link";
import { BookOpen } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function CoordinadorCursosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assignments } = user
    ? await supabase.from("course_coordinadores").select("course_id").eq("coordinador_id", user.id)
    : { data: [] };

  const courseIds = (assignments ?? []).map((a) => a.course_id as string);

  const { data: courses } = courseIds.length
    ? await supabase.from("courses").select("id, titulo").in("id", courseIds).order("titulo", { ascending: true })
    : { data: [] };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Mis cursos</h1>
        <p className="text-sm text-[--edu-text-muted]">
          Cursos asignados por el Admin — cargá materiales y mirá el progreso de los alumnos.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {(courses ?? []).map((course) => (
          <Link
            key={course.id}
            href={`/coordinador/cursos/${course.id}`}
            className="flex items-center gap-3 rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] px-4 py-3 transition-colors hover:border-[--edu-border-strong]"
          >
            <BookOpen className="h-4 w-4 shrink-0 text-[--inc-violet]" aria-hidden />
            <span className="flex-1 text-sm text-[--edu-text]">{course.titulo}</span>
          </Link>
        ))}

        {(courses ?? []).length === 0 ? (
          <p className="text-sm text-[--edu-text-muted]">
            Todavía no tenés cursos asignados. Pedile al Admin que te asigne uno en /admin/cursos.
          </p>
        ) : null}
      </div>
    </div>
  );
}
