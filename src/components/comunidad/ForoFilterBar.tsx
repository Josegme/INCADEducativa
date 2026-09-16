"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

interface ForoFilterBarProps {
  carreras: { id: string; nombre: string }[];
}

export function ForoFilterBar({ carreras }: ForoFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCarrera = searchParams.get("carrera") ?? "todas";

  function setCarrera(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "todas") {
      params.delete("carrera");
    } else {
      params.set("carrera", value);
    }
    router.push(`/comunidad${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const chips = [
    { value: "todas", label: "Todo" },
    { value: "institucional", label: "Feed institucional" },
    ...carreras.map((c) => ({ value: c.id, label: c.nombre })),
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <button
          key={chip.value}
          type="button"
          onClick={() => setCarrera(chip.value)}
          className={cn(
            "rounded-pill border-[0.5px] px-3 py-1 text-[12px] font-semibold transition-colors",
            activeCarrera === chip.value
              ? "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]"
              : "border-[--edu-border] text-[--edu-text-muted] hover:bg-white/5"
          )}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
