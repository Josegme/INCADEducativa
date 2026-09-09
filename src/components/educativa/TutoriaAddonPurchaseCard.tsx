"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { purchaseTutoriaAddonAction } from "@/app/(dashboard)/cursos/actions/tutoriaAddonActions";

interface TutoriaAddonPurchaseCardProps {
  courseId: string;
  precio: number;
}

/**
 * T13 — solo se renderiza para `comunidad` sin acceso todavía (ver gate en
 * cursos/[slug]/page.tsx). purchaseTutoriaAddonAction redirige a MP en éxito,
 * así que un error es la única respuesta que este componente necesita
 * manejar del lado del cliente.
 */
export function TutoriaAddonPurchaseCard({ courseId, precio }: TutoriaAddonPurchaseCardProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData();
    formData.set("courseId", courseId);
    const result = await purchaseTutoriaAddonAction(formData);
    setIsSubmitting(false);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-[14px] border-[0.5px] border-[--edu-border] bg-white/[0.03] p-4">
      <p className="text-[13px] text-[--edu-text-muted]">
        Las tutorías de este curso son un add-on aparte — pagalo una vez y accedés a todas las de este curso.
      </p>
      {error ? (
        <NotificationBanner type="danger" className="max-w-xs">
          {error}
        </NotificationBanner>
      ) : null}
      <Button type="submit" variant="primary" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Redirigiendo…" : `Desbloquear tutorías — $${precio}`}
      </Button>
    </form>
  );
}
