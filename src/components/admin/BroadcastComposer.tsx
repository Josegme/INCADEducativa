"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { broadcastAnnouncementAction } from "@/app/(dashboard)/(protected)/admin/actions/announcementActions";

const TEXTAREA_CLASS =
  "flex w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors placeholder:text-[--edu-text-faint] focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

interface Option {
  id: string;
  label: string;
}

interface BroadcastComposerProps {
  courses: Option[];
  careers: Option[];
}

function CheckboxList({
  options,
  selected,
  onToggle,
}: {
  options: Option[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  if (options.length === 0) {
    return <p className="text-[12px] text-[--edu-text-faint]">No hay opciones disponibles.</p>;
  }

  return (
    <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-md border-[0.5px] border-[--edu-border] p-2">
      {options.map((o) => (
        <label key={o.id} className="flex items-center gap-2 text-[13px] text-[--edu-text]">
          <input
            type="checkbox"
            checked={selected.has(o.id)}
            onChange={() => onToggle(o.id)}
            className="h-4 w-4 rounded-sm border-[--edu-border] accent-[--inc-violet]"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

export function BroadcastComposer({ courses, careers }: BroadcastComposerProps) {
  const [selectedCourses, setSelectedCourses] = React.useState<Set<string>>(new Set());
  const [selectedCareers, setSelectedCareers] = React.useState<Set<string>>(new Set());
  const [titulo, setTitulo] = React.useState("");
  const [body, setBody] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successCount, setSuccessCount] = React.useState<number | null>(null);

  function toggle(set: Set<string>, setSet: (s: Set<string>) => void, id: string) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSet(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessCount(null);

    const result = await broadcastAnnouncementAction(
      Array.from(selectedCourses),
      Array.from(selectedCareers),
      titulo,
      body
    );

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setTitulo("");
    setBody("");
    setSelectedCourses(new Set());
    setSelectedCareers(new Set());
    setSuccessCount(result.recipientCount ?? 0);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
      {error ? <NotificationBanner type="danger">{error}</NotificationBanner> : null}
      {successCount !== null ? (
        <NotificationBanner type="success">
          Comunicado enviado — {successCount} {successCount === 1 ? "persona notificada" : "personas notificadas"} (in-app + email).
        </NotificationBanner>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[12px] font-medium text-[--edu-text-muted]">Cursos</p>
          <CheckboxList
            options={courses}
            selected={selectedCourses}
            onToggle={(id) => toggle(selectedCourses, setSelectedCourses, id)}
          />
        </div>
        <div>
          <p className="mb-1 text-[12px] font-medium text-[--edu-text-muted]">Carreras (todos los alumnos de sus cursos publicados)</p>
          <CheckboxList
            options={careers}
            selected={selectedCareers}
            onToggle={(id) => toggle(selectedCareers, setSelectedCareers, id)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="comunicadoTitulo" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
          Título
        </label>
        <Input
          id="comunicadoTitulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          placeholder="Receso de fin de año"
        />
      </div>

      <div>
        <label htmlFor="comunicadoBody" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
          Mensaje
        </label>
        <textarea
          id="comunicadoBody"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          required
          className={TEXTAREA_CLASS}
          placeholder="Escribí el comunicado..."
        />
      </div>

      <Button type="submit" variant="primary" disabled={isLoading} className="self-start">
        {isLoading ? "Enviando…" : "Enviar comunicado"}
      </Button>
    </form>
  );
}
