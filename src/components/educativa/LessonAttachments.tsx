import { Download, Paperclip } from "lucide-react";

export interface LessonAttachmentLink {
  id: string;
  titulo: string;
  url: string;
}

interface LessonAttachmentsProps {
  attachments: LessonAttachmentLink[];
}

export function LessonAttachments({ attachments }: LessonAttachmentsProps) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.03] p-3">
      <span className="flex items-center gap-1.5 text-[12px] font-medium text-[--edu-text-muted]">
        <Paperclip className="h-3.5 w-3.5" aria-hidden />
        Materiales adjuntos
      </span>

      <ul className="flex flex-col gap-1.5">
        {attachments.map((a) => (
          <li key={a.id}>
            <a
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.03] px-2.5 py-1.5 text-[13px] text-[--edu-text] transition-colors hover:bg-[--inc-violet-subtle]"
            >
              <Download className="h-4 w-4 shrink-0 text-[--edu-text-muted]" aria-hidden />
              <span className="flex-1 truncate">{a.titulo}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
