"use client";

import * as React from "react";

import { CourseCard } from "@/components/educativa/CourseCard";
import { FilterBar } from "@/components/educativa/FilterBar";
import { MOCK_COURSES, type CourseCategory, type CourseLevel } from "@/modules/educativa/mockCatalog";

export default function CursosPage() {
  const [category, setCategory] = React.useState<CourseCategory | "todas">("todas");
  const [level, setLevel] = React.useState<CourseLevel | "todos">("todos");

  const courses = MOCK_COURSES.filter(
    (course) =>
      (category === "todas" || course.categoria === category) &&
      (level === "todos" || course.nivel === level)
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Cursos</h1>
        <p className="text-sm text-[--edu-text-muted]">Catálogo de cursos disponibles en INCADEducativa.</p>
      </div>

      <FilterBar
        activeCategory={category}
        onCategoryChange={setCategory}
        activeLevel={level}
        onLevelChange={setLevel}
      />

      {courses.length === 0 ? (
        <p className="text-sm text-[--edu-text-muted]">No hay cursos para este filtro.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
