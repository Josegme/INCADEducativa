import Link from "next/link";
import { Check, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import type { LessonState, ModuleWithLessons } from "@/modules/educativa/lessons";

interface LessonSidebarProps {
  courseSlug: string;
  modules: ModuleWithLessons[];
  lessonStateById: Map<string, LessonState>;
  activeLessonId: string;
}

export function LessonSidebar({ courseSlug, modules, lessonStateById, activeLessonId }: LessonSidebarProps) {
  return (
    <nav className="flex w-64 shrink-0 flex-col gap-4">
      {modules.map((module) => (
        <div key={module.id} className="flex flex-col gap-1">
          <span className="px-1 text-[12px] font-semibold uppercase tracking-[0.5px] text-[--edu-text-faint]">
            {module.titulo}
          </span>
          {module.lessons.map((lesson) => {
            const state = lessonStateById.get(lesson.id);
            const isActive = lesson.id === activeLessonId;
            const isLocked = state?.locked ?? true;
            const isCompleted = state?.completed ?? false;

            const icon = isCompleted ? (
              <Check className="h-3.5 w-3.5" aria-hidden />
            ) : isLocked ? (
              <Lock className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <span className="text-[11px] font-semibold">{lesson.orden}</span>
            );

            const content = (
              <>
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-pill border-[1.5px]",
                    isCompleted && "border-[--edu-success] bg-[--edu-success-subtle] text-[--edu-success]",
                    isActive && !isCompleted && "border-[--inc-violet] bg-[--inc-violet-subtle] text-[--inc-violet]",
                    isLocked && "border-white/[0.15] text-[--edu-text-faint]",
                    !isActive && !isCompleted && !isLocked && "border-[--edu-border-neutral] text-[--edu-text-muted]"
                  )}
                >
                  {icon}
                </span>
                <span
                  className={cn(
                    "text-[13px]",
                    isLocked ? "text-[--edu-text-faint]" : isActive ? "font-semibold text-[--edu-text]" : "text-[--edu-text-muted]"
                  )}
                >
                  {lesson.titulo}
                </span>
              </>
            );

            if (isLocked) {
              return (
                <span key={lesson.id} className="flex items-center gap-2 rounded-md px-1 py-1.5">
                  {content}
                </span>
              );
            }

            return (
              <Link
                key={lesson.id}
                href={`/cursos/${courseSlug}/lecciones/${lesson.id}`}
                className={cn(
                  "flex items-center gap-2 rounded-md px-1 py-1.5 transition-colors hover:bg-white/5",
                  isActive && "bg-[--inc-violet-subtle]"
                )}
              >
                {content}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
