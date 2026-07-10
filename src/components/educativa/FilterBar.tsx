"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { LEVEL_LABEL, type CourseLevel } from "@/modules/educativa/catalog";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  careers: { slug: string; nombre: string }[];
}

const LEVELS: (CourseLevel | "todos")[] = ["todos", "basico", "intermedio", "avanzado"];

export function FilterBar({ careers }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCarrera = searchParams.get("carrera") ?? "todas";
  const activeNivel = (searchParams.get("nivel") as CourseLevel | null) ?? "todos";

  function setParam(key: "carrera" | "nivel", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "todas" || value === "todos") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/cursos${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setParam("carrera", "todas")}
          className={cn(
            "rounded-pill border-[0.5px] px-3 py-1 text-[12px] font-semibold transition-colors",
            activeCarrera === "todas"
              ? "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]"
              : "border-[--edu-border] text-[--edu-text-muted] hover:bg-white/5"
          )}
        >
          Todas
        </button>
        {careers.map((career) => (
          <button
            key={career.slug}
            type="button"
            onClick={() => setParam("carrera", career.slug)}
            className={cn(
              "rounded-pill border-[0.5px] px-3 py-1 text-[12px] font-semibold transition-colors",
              activeCarrera === career.slug
                ? "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]"
                : "border-[--edu-border] text-[--edu-text-muted] hover:bg-white/5"
            )}
          >
            {career.nombre}
          </button>
        ))}
      </div>

      <select
        value={activeNivel}
        onChange={(e) => setParam("nivel", e.target.value)}
        className="h-9 rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 text-[13px] text-[--edu-text] focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]"
      >
        <option value="todos" className="bg-[--edu-surface-raised]">
          Todos los niveles
        </option>
        {LEVELS.filter((level): level is CourseLevel => level !== "todos").map((level) => (
          <option key={level} value={level} className="bg-[--edu-surface-raised]">
            {LEVEL_LABEL[level]}
          </option>
        ))}
      </select>
    </div>
  );
}
