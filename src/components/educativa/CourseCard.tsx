import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { LEVEL_LABEL, type CatalogCourse } from "@/modules/educativa/catalog";

interface CourseCardProps {
  course: CatalogCourse;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/cursos/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border-[0.5px] border-[--edu-border] bg-white/[0.04] transition-all hover:border-[--edu-border-strong] hover:shadow-card-violet"
    >
      <div className="flex h-[58px] items-center justify-center bg-[--inc-violet-subtle]">
        <BookOpen className="h-6 w-6 text-[--inc-violet]" aria-hidden />
      </div>
      <div className="flex flex-col gap-1 px-[10px] py-2">
        <span className="text-[12px] font-semibold uppercase tracking-[0.7px] text-[--inc-violet]">
          {course.carrera ? `${course.carrera.nombre} · ` : ""}
          {LEVEL_LABEL[course.nivel]}
        </span>
        <span className="text-[13px] font-medium leading-[1.3] text-[--edu-text]">{course.titulo}</span>
        {typeof course.progresoPct === "number" ? (
          <div className="mt-1 flex items-center gap-2">
            <Progress value={course.progresoPct} className="h-[3px]" />
            <span className="text-[10px] text-[--edu-text-muted]">{course.progresoPct}%</span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
