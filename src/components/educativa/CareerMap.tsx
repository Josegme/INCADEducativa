import { Award, Check, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { getCourseBySlug, type MockCareer } from "@/modules/educativa/mockCatalog";

interface CareerMapProps {
  career: MockCareer;
}

type NodeState = "completado" | "activo" | "bloqueado";

function nodeState(progresoPct: number | undefined, isFirstIncomplete: boolean): NodeState {
  if (progresoPct === 100) return "completado";
  if (isFirstIncomplete) return "activo";
  return "bloqueado";
}

export function CareerMap({ career }: CareerMapProps) {
  const courses = career.courseSlugs.map((slug) => getCourseBySlug(slug)).filter((c) => c !== undefined);
  const firstIncompleteIndex = courses.findIndex((c) => (c?.progresoPct ?? 0) < 100);
  const allCompleted = firstIncompleteIndex === -1 && courses.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">{career.nombre}</h1>
        <p className="mt-1 text-sm text-[--edu-text-muted]">{career.descripcion}</p>
      </div>

      <ol className="flex flex-col">
        {courses.map((course, index) => {
          if (!course) return null;
          const state = nodeState(course.progresoPct, index === firstIncompleteIndex);
          const currentCompleted = course.progresoPct === 100;

          return (
            <li key={course.slug} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-pill border-[1.5px]",
                    state === "completado" && "border-[--edu-success] bg-[--edu-success-subtle] text-[--edu-success]",
                    state === "activo" && "border-[--inc-violet] bg-[--inc-violet-subtle] text-[--inc-violet]",
                    state === "bloqueado" && "border-white/[0.15] text-[--edu-text-faint]"
                  )}
                >
                  {state === "completado" ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : state === "bloqueado" ? (
                    <Lock className="h-4 w-4" aria-hidden />
                  ) : (
                    <span className="text-[12px] font-semibold">{index + 1}</span>
                  )}
                </div>
                {index < courses.length - 1 ? (
                  <div className={cn("w-[2px] flex-1", currentCompleted ? "bg-[--edu-success]" : "bg-[--edu-border-neutral]")} />
                ) : null}
              </div>
              <div className="pb-6">
                <p className={cn("text-[13px] font-medium", state === "bloqueado" ? "text-[--edu-text-faint]" : "text-[--edu-text]")}>
                  {course.titulo}
                </p>
                <p className="text-[12px] text-[--edu-text-muted]">{course.duracionHs} hs</p>
              </div>
            </li>
          );
        })}

        {allCompleted ? (
          <li className="flex items-center gap-3 rounded-lg border-[0.5px] border-[--edu-gold-border] bg-[--edu-gold-subtle] px-4 py-3">
            <Award className="h-6 w-6 text-[--edu-gold]" aria-hidden />
            <span className="text-[13px] font-semibold text-[--edu-gold]">Certificado de especialización disponible</span>
          </li>
        ) : null}
      </ol>
    </div>
  );
}
