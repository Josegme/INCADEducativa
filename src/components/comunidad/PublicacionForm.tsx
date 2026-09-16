"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Textarea } from "@/components/ui/textarea";
import { crearPublicacionAction } from "@/app/(dashboard)/(protected)/comunidad/actions";

interface PublicacionFormProps {
  /** null si el usuario no pertenece a ninguna carrera (comunidad/lead/coordinador sin carrera). */
  miCarrera: { id: string; nombre: string } | null;
  isAdmin: boolean;
}

export function PublicacionForm({ miCarrera, isAdmin }: PublicacionFormProps) {
  const [contenido, setContenido] = React.useState("");
  const [scope, setScope] = React.useState<"institucional" | "carrera">("institucional");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const puedeElegirCarrera = Boolean(miCarrera) || isAdmin;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("contenido", contenido);
    if (scope === "carrera" && miCarrera) {
      formData.set("carreraId", miCarrera.id);
    }

    const result = await crearPublicacionAction(formData);
    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setContenido("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
      {error ? (
        <NotificationBanner type="danger" role="alert">
          {error}
        </NotificationBanner>
      ) : null}

      <Textarea
        placeholder="Compartí algo con la comunidad…"
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        maxLength={2000}
        required
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        {puedeElegirCarrera ? (
          <div className="flex items-center gap-1.5 text-[12px] text-[--edu-text-muted]">
            <label className="flex items-center gap-1">
              <input type="radio" name="scope" checked={scope === "institucional"} onChange={() => setScope("institucional")} />
              Feed institucional
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="scope" checked={scope === "carrera"} onChange={() => setScope("carrera")} />
              {miCarrera ? `Foro de ${miCarrera.nombre}` : "Foro de carrera (elegí una carrera)"}
            </label>
          </div>
        ) : (
          <span className="text-[12px] text-[--edu-text-faint]">Se publica en el feed institucional.</span>
        )}

        <Button type="submit" size="sm" disabled={isLoading || contenido.trim().length === 0}>
          {isLoading ? "Publicando…" : "Publicar"}
        </Button>
      </div>
    </form>
  );
}
