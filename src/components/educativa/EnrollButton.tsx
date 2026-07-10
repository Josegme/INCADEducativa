"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { enrollUserAction } from "@/app/(dashboard)/cursos/actions/enrollActions";

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  esGratuito: boolean;
  progresoPct?: number;
  canEnroll: boolean;
  /** Lección a la que lleva "Continuar" — undefined si el curso todavía no tiene contenido. */
  resumeLessonId?: string;
}

export function EnrollButton({ courseId, courseSlug, esGratuito, progresoPct, canEnroll, resumeLessonId }: EnrollButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleEnroll() {
    setIsLoading(true);
    setError(null);
    const result = await enrollUserAction(courseId, courseSlug);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  if (!canEnroll) {
    return <Badge state="locked">Vista previa — inscripción disponible para alumnos INCADE</Badge>;
  }

  if (typeof progresoPct === "number" && progresoPct >= 100) {
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

  if (typeof progresoPct === "number") {
    return (
      <div className="flex items-center gap-3">
        <div className="flex w-40 items-center gap-2">
          <Progress value={progresoPct} />
          <span className="text-[12px] text-[--edu-text-muted]">{progresoPct}%</span>
        </div>
        <Button variant="outline" disabled={!resumeLessonId} asChild={Boolean(resumeLessonId)}>
          {resumeLessonId ? (
            <Link href={`/cursos/${courseSlug}/lecciones/${resumeLessonId}`}>
              <Play className="h-4 w-4" aria-hidden />
              Continuar
            </Link>
          ) : (
            <span>
              <Play className="h-4 w-4" aria-hidden />
              Continuar
            </span>
          )}
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
    <div className="flex flex-col gap-2">
      {error ? (
        <NotificationBanner type="danger" className="max-w-xs">
          {error}
        </NotificationBanner>
      ) : null}
      <Button variant="primary" onClick={handleEnroll} disabled={isLoading}>
        {isLoading ? "Inscribiendo…" : "Inscribirme gratis"}
      </Button>
    </div>
  );
}
