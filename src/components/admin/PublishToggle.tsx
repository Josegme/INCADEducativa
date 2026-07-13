"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { CourseStatusValue } from "@/modules/admin/courses";
import { setCourseEstadoAction } from "@/app/(dashboard)/admin/actions/courseActions";

interface PublishToggleProps {
  courseId: string;
  estado: CourseStatusValue;
}

export function PublishToggle({ courseId, estado }: PublishToggleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const isPublicado = estado === "publicado";

  if (estado === "revision") {
    return null;
  }

  async function handleClick() {
    setIsLoading(true);
    await setCourseEstadoAction(courseId, isPublicado ? "borrador" : "publicado");
    setIsLoading(false);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" disabled={isLoading} onClick={handleClick}>
      {isPublicado ? "Volver a borrador" : "Publicar"}
    </Button>
  );
}
