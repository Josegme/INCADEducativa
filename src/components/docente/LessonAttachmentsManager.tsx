"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { createClient } from "@/lib/supabase/client";
import { LESSON_CONTENT_BUCKET } from "@/lib/supabase/storage";
import type { LessonAttachment } from "@/modules/educativa/lessons";
import {
  addLessonAttachmentAction,
  deleteLessonAttachmentAction,
} from "@/app/(dashboard)/(protected)/docente/actions/lessonAttachmentActions";

function sanitizeFilename(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-");
}

interface LessonAttachmentsManagerProps {
  lessonId: string;
  courseId: string;
  attachments: LessonAttachment[];
}

export function LessonAttachmentsManager({ lessonId, courseId, attachments }: LessonAttachmentsManagerProps) {
  const router = useRouter();
  const [titulo, setTitulo] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!titulo.trim()) {
      setError("Poné un nombre para el adjunto antes de subir el archivo");
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    setError(null);

    const path = `${courseId}/adjuntos/${lessonId}/${Date.now()}-${sanitizeFilename(file.name)}`;
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage.from(LESSON_CONTENT_BUCKET).upload(path, file);

    if (uploadError) {
      setError(uploadError.message);
      setIsUploading(false);
      e.target.value = "";
      return;
    }

    const result = await addLessonAttachmentAction(lessonId, courseId, titulo.trim(), path, attachments.length);
    setIsUploading(false);
    e.target.value = "";

    if (result.error) {
      setError(result.error);
      return;
    }

    setTitulo("");
    router.refresh();
  }

  async function handleDelete(attachmentId: string) {
    setDeletingId(attachmentId);
    const result = await deleteLessonAttachmentAction(attachmentId, courseId);
    setDeletingId(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.03] p-3">
      <span className="text-[12px] font-medium text-[--edu-text-muted]">Materiales adjuntos (opcional)</span>

      {error ? (
        <NotificationBanner type="danger" className="text-[12px]">
          {error}
        </NotificationBanner>
      ) : null}

      {attachments.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-2 rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.03] px-2.5 py-1.5"
            >
              <FileText className="h-4 w-4 shrink-0 text-[--edu-text-muted]" aria-hidden />
              <span className="flex-1 truncate text-[13px] text-[--edu-text]">{a.titulo}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(a.id)}
                disabled={deletingId === a.id}
                aria-label={`Borrar adjunto ${a.titulo}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="attachmentTitulo" className="mb-1 block text-[12px] text-[--edu-text-muted]">
            Nombre del adjunto
          </label>
          <Input
            id="attachmentTitulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Guía de ejercicios"
          />
        </div>
        {isUploading ? (
          <span className="px-[11px] py-[5px] text-[12px] text-[--edu-text-muted]">Subiendo…</span>
        ) : (
          <Button type="button" variant="outline" size="sm" asChild className="w-fit cursor-pointer">
            <label>
              <UploadCloud className="h-4 w-4" aria-hidden />
              Subir
              <input type="file" className="sr-only" onChange={handleFileChange} />
            </label>
          </Button>
        )}
      </div>
    </div>
  );
}
