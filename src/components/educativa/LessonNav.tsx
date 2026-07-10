import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface LessonNavProps {
  courseSlug: string;
  previousLessonId: string | null;
  nextLessonId: string | null;
  nextLocked: boolean;
}

export function LessonNav({ courseSlug, previousLessonId, nextLessonId, nextLocked }: LessonNavProps) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" disabled={!previousLessonId} asChild={Boolean(previousLessonId)}>
        {previousLessonId ? (
          <Link href={`/cursos/${courseSlug}/lecciones/${previousLessonId}`}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Anterior
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Anterior
          </span>
        )}
      </Button>

      <Button variant="primary" disabled={!nextLessonId || nextLocked} asChild={Boolean(nextLessonId) && !nextLocked}>
        {nextLessonId && !nextLocked ? (
          <Link href={`/cursos/${courseSlug}/lecciones/${nextLessonId}`}>
            Siguiente
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span>
            Siguiente
            <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        )}
      </Button>
    </div>
  );
}
