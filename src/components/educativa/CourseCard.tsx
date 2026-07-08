import Link from "next/link";
import { BarChart3, Lightbulb, TrendingUp, Users, type LucideIcon } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { CATEGORY_LABEL, LEVEL_LABEL, type MockCourse } from "@/modules/educativa/mockCatalog";

const CATEGORY_STYLE: Record<MockCourse["categoria"], { bg: string; icon: LucideIcon; iconColor: string }> = {
  marketing: { bg: "rgba(155,48,255,0.10)", icon: BarChart3, iconColor: "var(--inc-violet)" },
  finanzas: { bg: "rgba(192,38,211,0.08)", icon: TrendingUp, iconColor: "var(--inc-magenta)" },
  rrhh: { bg: "rgba(16,185,129,0.08)", icon: Users, iconColor: "var(--edu-success)" },
  innovacion: { bg: "rgba(245,158,11,0.08)", icon: Lightbulb, iconColor: "var(--edu-warning)" },
};

interface CourseCardProps {
  course: MockCourse;
}

export function CourseCard({ course }: CourseCardProps) {
  const { bg, icon: Icon, iconColor } = CATEGORY_STYLE[course.categoria];

  return (
    <Link
      href={`/cursos/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border-[0.5px] border-[--edu-border] bg-white/[0.04] transition-all hover:border-[--edu-border-strong] hover:shadow-card-violet"
    >
      <div className="flex h-[58px] items-center justify-center" style={{ backgroundColor: bg }}>
        <Icon className="h-6 w-6" style={{ color: iconColor }} aria-hidden />
      </div>
      <div className="flex flex-col gap-1 px-[10px] py-2">
        <span className="text-[12px] font-semibold uppercase tracking-[0.7px] text-[--inc-violet]">
          {CATEGORY_LABEL[course.categoria]} · {LEVEL_LABEL[course.nivel]}
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
