"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h1 className="text-title font-semibold text-white">Algo salió mal</h1>
      <p className="text-body text-[--edu-text-muted]">No pudimos cargar esta pantalla. Probá de nuevo.</p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
