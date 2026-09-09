import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import type { CourseStatusValue } from "@/modules/admin/courses";

const ESTADO_BADGE: Record<CourseStatusValue, "active" | "pending" | "completed" | "locked"> = {
  borrador: "locked",
  revision: "pending",
  publicado: "completed",
  archivado: "locked",
};

const ESTADO_LABEL: Record<CourseStatusValue, string> = {
  borrador: "Borrador",
  revision: "En revisión",
  publicado: "Publicado",
  archivado: "Archivado",
};

export default async function DocentePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: courses } = user
    ? await supabase
        .from("courses")
        .select("id, titulo, estado")
        .eq("docente_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Mis cursos</h1>
        <p className="text-sm text-[--edu-text-muted]">
          Cursos que dictás. Cargá módulos y clases y enviá a revisión cuando estén listos.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {(courses ?? []).map((course) => (
          <Link
            key={course.id}
            href={`/docente/cursos/${course.id}`}
            className="flex items-center gap-3 rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] px-4 py-3 transition-colors hover:border-[--edu-border-strong]"
          >
            <BookOpen className="h-4 w-4 shrink-0 text-[--inc-violet]" aria-hidden />
            <span className="flex-1 text-sm text-[--edu-text]">{course.titulo}</span>
            <Badge state={ESTADO_BADGE[course.estado as CourseStatusValue]}>
              {ESTADO_LABEL[course.estado as CourseStatusValue]}
            </Badge>
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
