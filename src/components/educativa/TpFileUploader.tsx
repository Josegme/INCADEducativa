"use client";

import * as React from "react";
import { CheckCircle2, UploadCloud } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { createClient } from "@/lib/supabase/client";
import { TP_SUBMISSIONS_BUCKET } from "@/lib/supabase/storage";

interface TpFileUploaderProps {
  evaluationId: string;
  userId: string;
  value: string;
  onUploaded: (path: string) => void;
}

function sanitizeFilename(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function TpFileUploader({ evaluationId, userId, value, onUploaded }: TpFileUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);

    const tick = setInterval(() => {
      setProgress((p) => (p < 90 ? p + 10 : p));
    }, 250);

    const path = `${evaluationId}/${userId}/${Date.now()}-${sanitizeFilename(file.name)}`;
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage.from(TP_SUBMISSIONS_BUCKET).upload(path, file);

    clearInterval(tick);

    if (uploadError) {
      setError(uploadError.message);
      setIsUploading(false);
      setProgress(0);
      return;
    }

    setProgress(100);
    setFileName(file.name);
    setIsUploading(false);
    onUploaded(path);
  }

  return (
    <div className="flex flex-col gap-2">
      {error ? (
        <NotificationBanner type="danger" className="text-[12px]">
          {error}
        </NotificationBanner>
      ) : null}

      {value && !isUploading ? (
        <div className="flex items-center gap-2 text-[13px] text-[--edu-success-text]">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          {fileName ?? "Archivo cargado"}
        </div>
      ) : null}

      {isUploading ? (
        <div className="flex flex-col gap-1.5">
          <Progress value={progress} />
          <span className="text-[12px] text-[--edu-text-muted]">Subiendo…</span>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" asChild className="w-fit cursor-pointer">
          <label>
            <UploadCloud className="h-4 w-4" aria-hidden />
            {value ? "Reemplazar archivo" : "Subir archivo"}
            <input type="file" className="sr-only" onChange={handleFileChange} />
          </label>
        </Button>
      )}
    </div>
  );
}
