"use client";

import * as React from "react";
import { Award, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface EnrollButtonProps {
  esGratuito: boolean;
  progresoPct?: number;
}

export function EnrollButton({ esGratuito, progresoPct }: EnrollButtonProps) {
  const [enrolled, setEnrolled] = React.useState(typeof progresoPct === "number");
  const [pct] = React.useState(progresoPct ?? 0);

  if (enrolled && pct >= 100) {
    return (
      <div className="flex items-center gap-3">
        <Badge state="completed">Completado</Badge>
        <Button variant="ghost" disabled title="Certificados: Sprint 9-10">
          <Award className="h-4 w-4" aria-hidden />
          Ver certificado
        </Button>
      </div>
    );
  }

  if (enrolled) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex w-40 items-center gap-2">
          <Progress value={pct} />
          <span className="text-[12px] text-[--edu-text-muted]">{pct}%</span>
        </div>
        <Button variant="outline">
          <Play className="h-4 w-4" aria-hidden />
          Continuar
        </Button>
      </div>
    );
  }

  if (!esGratuito) {
    return (
      <Button variant="primary" disabled title="Cursos pagos disponibles en Etapa 3">
        Disponible en Etapa 3
      </Button>
    );
  }

  return (
    <Button variant="primary" onClick={() => setEnrolled(true)}>
      Inscribirme gratis
    </Button>
  );
}
