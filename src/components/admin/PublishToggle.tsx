"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { CourseStatusValue } from "@/modules/admin/courses";
import { setCourseEstadoAction } from "@/app/(dashboard)/(protected)/admin/actions/courseActions";

interface PublishToggleProps {
  courseId: string;
  estado: CourseStatusValue;
}

export function PublishToggle({ courseId, estado }: PublishToggleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isPublicado = estado === "publicado";

  if (estado === "revision") {
    return null;
  }

  async function handleClick() {
    setIsLoading(true);
    setError(null);
    const result = await setCourseEstadoAction(courseId, isPublicado ? "borrador" : "publicado");
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant="ghost" size="sm" disabled={isLoading} onClick={handleClick}>
        {isPublicado ? "Volver a borrador" : "Publicar"}
      </Button>
      {error ? <span className="text-[12px] text-[--edu-danger-text]">{error}</span> : null}
    </div>
  );
}
