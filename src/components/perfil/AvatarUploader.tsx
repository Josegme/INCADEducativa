"use client";

import * as React from "react";
import { UploadCloud, UserCircle2 } from "lucide-react";

import { NotificationBanner } from "@/components/ui/notification-banner";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_BUCKET } from "@/lib/supabase/storage";
import { updateAvatarAction } from "@/app/(dashboard)/actions/profileActions";
import { cn } from "@/lib/utils";

interface AvatarUploaderProps {
  userId: string;
  initialSignedUrl: string | null;
  initials?: string;
}

function sanitizeFilename(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function AvatarUploader({ userId, initialSignedUrl, initials }: AvatarUploaderProps) {
  const [previewUrl, setPreviewUrl] = React.useState(initialSignedUrl);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const path = `${userId}/${Date.now()}-${sanitizeFilename(file.name)}`;
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setIsUploading(false);
      return;
    }

    const result = await updateAvatarAction(path);
    if (result.error) {
      setError(result.error);
      setIsUploading(false);
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(false);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {error ? (
        <NotificationBanner type="danger" className="text-[12px]">
          {error}
        </NotificationBanner>
      ) : null}

      <div
        className={cn(
          "flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[1.5px] border-[--inc-violet-border-strong] bg-[--inc-violet]",
          isUploading && "opacity-60"
        )}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
        ) : initials ? (
          <span className="text-[20px] font-semibold text-white">{initials}</span>
        ) : (
          <UserCircle2 className="h-10 w-10 text-white" aria-hidden />
        )}
      </div>

      <label className="flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-[--inc-violet-text] hover:underline">
        <UploadCloud className="h-3.5 w-3.5" aria-hidden />
        {isUploading ? "Subiendo…" : previewUrl ? "Cambiar foto" : "Subir foto"}
        <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} disabled={isUploading} />
      </label>
    </div>
  );
}
