"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { saveLessonProgressAction } from "@/app/(dashboard)/cursos/actions/lessonProgressActions";
import type { LessonType } from "@/modules/educativa/lessons";

interface ContentViewerProps {
  lessonId: string;
  tipo: LessonType;
  contenidoText: string | null;
  documentoUrl?: string | null;
  completed: boolean;
}

export function ContentViewer({ lessonId, tipo, contenidoText, documentoUrl, completed }: ContentViewerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleComplete() {
    setIsLoading(true);
    await saveLessonProgressAction(lessonId, 0, true);
    setIsLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {tipo === "texto" ? (
        <p className="whitespace-pre-line text-sm leading-[1.65] text-[--edu-text]">{contenidoText}</p>
      ) : documentoUrl ? (
        <Button variant="outline" asChild className="w-fit">
          <a href={documentoUrl} target="_blank" rel="noreferrer">
            <Download className="h-4 w-4" aria-hidden />
            Descargar material
          </a>
        </Button>
      ) : (
        <p className="text-sm text-[--edu-text-muted]">El material de esta clase no está disponible.</p>
      )}

      {completed ? (
        <Badge state="completed" className="w-fit">
          Completada
        </Badge>
      ) : (
        <Button variant="primary" className="w-fit" onClick={handleComplete} disabled={isLoading}>
          {isLoading ? "Guardando…" : "Marcar como completada"}
        </Button>
      )}
    </div>
  );
}
