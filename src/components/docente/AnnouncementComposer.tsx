"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { createAnnouncementAction } from "@/app/(dashboard)/docente/actions/announcementActions";

const TEXTAREA_CLASS =
  "flex w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors placeholder:text-[--edu-text-faint] focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

interface AnnouncementComposerProps {
  courseId: string;
}

export function AnnouncementComposer({ courseId }: AnnouncementComposerProps) {
  const router = useRouter();
  const [titulo, setTitulo] = React.useState("");
  const [body, setBody] = React.useState("");
  const [attachmentUrl, setAttachmentUrl] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await createAnnouncementAction(courseId, titulo, body, attachmentUrl);

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setTitulo("");
    setBody("");
    setAttachmentUrl("");
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
      <h2 className="text-sm font-semibold text-white">+ Nuevo anuncio</h2>

      {error ? <NotificationBanner type="danger">{error}</NotificationBanner> : null}
      {success ? <NotificationBanner type="success">Anuncio publicado — se notificó a los inscriptos.</NotificationBanner> : null}

      <div>
        <label htmlFor="announcementTitulo" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
          Título (opcional)
        </label>
        <Input
          id="announcementTitulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Recordatorio de entrega"
        />
      </div>

      <div>
        <label htmlFor="announcementBody" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
          Mensaje
        </label>
        <textarea
          id="announcementBody"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          required
          className={TEXTAREA_CLASS}
          placeholder="Escribí el mensaje para tus alumnos..."
        />
      </div>

      <div>
        <label htmlFor="announcementAttachment" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
          Link adjunto (opcional)
        </label>
        <Input
          id="announcementAttachment"
          type="url"
          value={attachmentUrl}
          onChange={(e) => setAttachmentUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <Button type="submit" variant="primary" disabled={isLoading} className="self-start">
        {isLoading ? "Publicando…" : "Publicar anuncio"}
      </Button>
    </form>
  );
}
