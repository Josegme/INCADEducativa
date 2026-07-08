import { notFound } from "next/navigation";
import { Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EnrollButton } from "@/components/educativa/EnrollButton";
import { CATEGORY_LABEL, LEVEL_LABEL, MOCK_CAREERS, getCourseBySlug } from "@/modules/educativa/mockCatalog";

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = getCourseBySlug(params.slug);
  if (!course) {
    notFound();
  }

  const modules = [
    `Introducción a ${course.titulo}`,
    "Desarrollo de contenidos",
    "Cierre y evaluación final",
  ];

  const career = MOCK_CAREERS.find((c) => c.courseSlugs.includes(course.slug));

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-[0.7px] text-[--inc-violet]">
          {CATEGORY_LABEL[course.categoria]}
        </span>
        <h1 className="text-[20px] font-semibold text-white">{course.titulo}</h1>
        <p className="text-sm text-[--edu-text-muted]">{course.descripcion}</p>
        <div className="flex items-center gap-3">
          <Badge state="locked">{LEVEL_LABEL[course.nivel]}</Badge>
          <span className="flex items-center gap-1 text-[12px] text-[--edu-text-muted]">
            <Clock className="h-[14px] w-[14px]" aria-hidden />
            {course.duracionHs} hs
          </span>
          {career ? <span className="text-[12px] text-[--edu-text-muted]">Carrera: {career.nombre}</span> : null}
        </div>
      </div>

      <EnrollButton esGratuito={course.esGratuito} progresoPct={course.progresoPct} />

      <div>
        <h2 className="mb-2 text-[13px] font-semibold text-[--edu-text]">Contenido del curso</h2>
        <ol className="flex flex-col gap-1.5">
          {modules.map((titulo, i) => (
            <li key={titulo} className="flex items-center gap-2 text-[13px] text-[--edu-text-muted]">
              <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-white/5 text-[11px] text-[--edu-text-faint]">
                {i + 1}
              </span>
              {titulo}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
