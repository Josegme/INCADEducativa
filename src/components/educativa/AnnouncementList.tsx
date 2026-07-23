"use client";

import * as React from "react";
import { Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  markAllAnnouncementsReadAction,
  markAnnouncementReadAction,
} from "@/app/(dashboard)/actions/notificationActions";
import type { AnnouncementRow } from "@/modules/comunicacion/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

interface AnnouncementListProps {
  announcements: AnnouncementRow[];
  courseId?: string;
  courseSlug?: string;
  readAnnouncementIds?: string[];
}

export function AnnouncementList({ announcements, courseId, courseSlug, readAnnouncementIds }: AnnouncementListProps) {
  const trackReads = Boolean(readAnnouncementIds && courseId && courseSlug);
  const [readIds, setReadIds] = React.useState(new Set(readAnnouncementIds ?? []));

  async function handleItemClick(announcementId: string) {
    if (!trackReads || readIds.has(announcementId)) return;
    setReadIds((prev) => new Set(prev).add(announcementId));
    await markAnnouncementReadAction(announcementId, courseSlug!);
  }

  async function handleMarkAllRead() {
    setReadIds(new Set(announcements.map((a) => a.id)));
    await markAllAnnouncementsReadAction(courseId!, courseSlug!);
  }

  if (announcements.length === 0) {
    return <p className="text-[13px] text-[--edu-text-muted]">Todavía no hay anuncios en este curso.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {trackReads ? (
        <Button variant="outline" size="sm" className="self-start" onClick={handleMarkAllRead}>
          Marcar todos como leídos
        </Button>
      ) : null}

      <div className="flex flex-col gap-2">
        {announcements.map((announcement) => {
          const isUnread = trackReads && !readIds.has(announcement.id);
          const content = (
            <div className="flex flex-col gap-1.5 rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4 text-left">
              <div className="flex items-center gap-2">
                {isUnread ? <span className="h-1.5 w-1.5 shrink-0 rounded-pill bg-[--inc-violet]" aria-hidden /> : null}
                <span className="text-[13px] font-semibold text-white">
                  {announcement.sender_nombre} {announcement.sender_apellido}
                </span>
                <span className="text-[11px] text-[--edu-text-faint]">{formatDate(announcement.created_at)}</span>
              </div>
              {announcement.titulo ? <span className="text-[13px] font-medium text-[--edu-text]">{announcement.titulo}</span> : null}
              <p className="whitespace-pre-wrap text-[13px] text-[--edu-text-muted]">{announcement.body}</p>
              {announcement.attachment_url ? (
                <a
                  href={announcement.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-fit items-center gap-1 text-[12px] text-[--inc-violet-text] hover:underline"
                >
                  <Paperclip className="h-3.5 w-3.5" aria-hidden />
                  Ver adjunto
                </a>
              ) : null}
            </div>
          );

          return trackReads ? (
            <button key={announcement.id} type="button" onClick={() => handleItemClick(announcement.id)} className="text-left">
              {content}
            </button>
          ) : (
            <div key={announcement.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
