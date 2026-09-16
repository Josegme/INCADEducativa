import Link from "next/link";
import { BookOpen, ClipboardList, Clock, GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth/session";
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
  const user = await getCurrentUser();

  if (!user) {
    return <Skeleton className="h-40 w-full" />;
  }

  const { data: courses } = await supabase
    .from("courses")
    .select("id, titulo, estado")
    .eq("docente_id", user.id)
    .order("created_at", { ascending: false });

  const courseIds = (courses ?? []).map((c) => c.id);

  const [{ data: pendingAttempts }, { data: nextTutorias }] = await Promise.all([
    courseIds.length
      ? supabase
          .from("evaluation_attempts")
          .select("id, evaluation_id, evaluations!inner(id, titulo, course_id)")
          .eq("estado", "pendiente_correccion")
          .in("evaluations.course_id", courseIds)
          .limit(8)
      : Promise.resolve({
          data: [] as {
            id: string;
            evaluation_id: string;
            evaluations: { id: string; titulo: string; course_id: string } | null;
          }[],
        }),
    courseIds.length
      ? supabase
          .from("tutorias")
          .select("id, fecha_inicio, curso_id")
          .in("curso_id", courseIds)
          .eq("estado", "programada")
          .gte("fecha_inicio", new Date().toISOString())
          .order("fecha_inicio", { ascending: true })
          .limit(3)
      : Promise.resolve({
          data: [] as { id: string; fecha_inicio: string; curso_id: string }[],
        }),
  ]);

  const courseById = new Map((courses ?? []).map((c) => [c.id, c]));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Panel docente"
        description="Lo urgente de hoy: correcciones, próximas tutorías y tus cursos."
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[--inc-violet-text]" aria-hidden />
            <h2 className="text-section font-semibold text-white">Correcciones pendientes</h2>
          </div>
          {(pendingAttempts ?? []).length === 0 ? (
            <p className="text-body text-[--edu-text-muted]">No hay entregas esperando corrección.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {(pendingAttempts ?? []).map((attempt) => {
                const evaluation = attempt.evaluations as unknown as {
                  id: string;
                  titulo: string;
                  course_id: string;
                } | null;
                const course = evaluation ? courseById.get(evaluation.course_id) : null;
                if (!evaluation || !course) return null;
                return (
                  <li key={attempt.id}>
                    <Link
                      href={`/docente/cursos/${course.id}/evaluaciones/${evaluation.id}`}
                      className="flex items-center justify-between rounded-md border-[0.5px] border-[--edu-border] px-3 py-2 hover:border-[--edu-border-strong]"
                    >
                      <span className="text-body text-white">{evaluation.titulo}</span>
                      <span className="text-caption text-[--edu-text-muted]">{course.titulo}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[--inc-violet-text]" aria-hidden />
            <h2 className="text-section font-semibold text-white">Próximas tutorías</h2>
          </div>
          {(nextTutorias ?? []).length === 0 ? (
            <p className="text-body text-[--edu-text-muted]">No hay tutorías programadas.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {(nextTutorias ?? []).map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/docente/cursos/${t.curso_id}/tutorias/${t.id}`}
                    className="flex flex-col rounded-md border-[0.5px] border-[--edu-border] px-3 py-2 hover:border-[--edu-border-strong]"
                  >
                    <span className="text-body text-white">
                      {courseById.get(t.curso_id)?.titulo ?? "Tutoría"}
                    </span>
                    <span className="text-caption text-[--edu-text-muted]">
                      {new Date(t.fecha_inicio).toLocaleString("es-AR")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section font-semibold text-white">Mis cursos</h2>
        {(courses ?? []).length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Todavía no tenés cursos asignados"
            description="Cuando el admin te asigne un curso, aparece acá para editar clases y evaluaciones."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {(courses ?? []).map((course) => (
              <Link
                key={course.id}
                href={`/docente/cursos/${course.id}`}
                className="flex items-center justify-between rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface] p-4 hover:border-[--edu-border-strong]"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-[--inc-violet-text]" aria-hidden />
                  <span className="text-body font-semibold text-white">{course.titulo}</span>
                </div>
                <Badge state={ESTADO_BADGE[course.estado as CourseStatusValue]}>
                  {ESTADO_LABEL[course.estado as CourseStatusValue]}
                </Badge>
              </Link>
            ))}
          </div>
        )}
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href="/docente">Actualizar</Link>
        </Button>
      </section>
    </div>
  );
}
