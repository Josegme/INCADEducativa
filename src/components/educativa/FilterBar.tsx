"use client";

import { CATEGORY_LABEL, LEVEL_LABEL, type CourseCategory, type CourseLevel } from "@/modules/educativa/mockCatalog";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  activeCategory: CourseCategory | "todas";
  onCategoryChange: (category: CourseCategory | "todas") => void;
  activeLevel: CourseLevel | "todos";
  onLevelChange: (level: CourseLevel | "todos") => void;
}

const CATEGORIES: (CourseCategory | "todas")[] = ["todas", "marketing", "finanzas", "rrhh", "innovacion"];
const LEVELS: (CourseLevel | "todos")[] = ["todos", "basico", "intermedio", "avanzado"];

export function FilterBar({ activeCategory, onCategoryChange, activeLevel, onLevelChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={cn(
              "rounded-pill border-[0.5px] px-3 py-1 text-[12px] font-semibold transition-colors",
              activeCategory === category
                ? "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]"
                : "border-[--edu-border] text-[--edu-text-muted] hover:bg-white/5"
            )}
          >
            {category === "todas" ? "Todas" : CATEGORY_LABEL[category]}
          </button>
        ))}
      </div>

      <select
        value={activeLevel}
        onChange={(e) => onLevelChange(e.target.value as CourseLevel | "todos")}
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
