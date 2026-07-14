"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/app/(dashboard)/actions/notificationActions";
import { NOTIFICATION_TYPE_LABEL, type NotificationRow } from "@/modules/comunicacion/types";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "recién";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

function linkFor(notification: NotificationRow, slugByCourse: Map<string, string>) {
  if (!notification.course_id) return null;
  if (notification.tipo === "announcement") {
    const slug = slugByCourse.get(notification.course_id);
    return slug ? `/cursos/${slug}` : null;
  }
  if (notification.tipo === "contenido_publicado" || notification.tipo === "sistema") {
    return `/docente/cursos/${notification.course_id}`;
  }
  return null;
}

interface NotificationPanelProps {
  onUnreadDelta: (delta: number) => void;
  onClose: () => void;
}

export function NotificationPanel({ onUnreadDelta, onClose }: NotificationPanelProps) {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<NotificationRow[]>([]);
  const [slugByCourse, setSlugByCourse] = React.useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      const { data: rows } = await supabase
        .from("notifications")
        .select("id, tipo, course_id, referencia_id, titulo, cuerpo, leida, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (cancelled) return;

      const list = (rows ?? []) as NotificationRow[];
      setNotifications(list);

      const courseIds = Array.from(
        new Set(list.filter((n) => n.tipo === "announcement" && n.course_id).map((n) => n.course_id as string))
      );

      if (courseIds.length > 0) {
        const { data: courses } = await supabase.from("courses").select("id, slug").in("id", courseIds);
        if (!cancelled) {
          setSlugByCourse(new Map((courses ?? []).map((c) => [c.id as string, c.slug as string])));
        }
      }

      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleItemClick(notification: NotificationRow) {
    if (!notification.leida) {
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, leida: true } : n)));
      onUnreadDelta(-1);
      await markNotificationReadAction(notification.id);
    }

    const href = linkFor(notification, slugByCourse);
    if (href) {
      onClose();
      router.push(href);
    }
  }

  async function handleMarkAllRead() {
    const unreadCount = notifications.filter((n) => !n.leida).length;
    setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
    onUnreadDelta(-unreadCount);
    await markAllNotificationsReadAction();
  }

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-50 flex max-h-[70vh] w-80 flex-col overflow-hidden rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-raised] shadow-xl">
      <div className="flex items-center justify-between border-b-[0.5px] border-[--edu-border] px-3 py-2">
        <span className="text-[13px] font-semibold text-white">Notificaciones</span>
        <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
          Marcar todas como leídas
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="px-3 py-4 text-[13px] text-[--edu-text-muted]">Cargando…</p>
        ) : notifications.length === 0 ? (
          <p className="px-3 py-4 text-[13px] text-[--edu-text-muted]">No tenés notificaciones todavía.</p>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => handleItemClick(notification)}
              className="flex w-full flex-col gap-1 border-b-[0.5px] border-[--edu-border] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-2">
                {!notification.leida ? <span className="h-1.5 w-1.5 shrink-0 rounded-pill bg-[--inc-violet]" aria-hidden /> : null}
                <Badge state="active">{NOTIFICATION_TYPE_LABEL[notification.tipo]}</Badge>
                <span className="ml-auto text-[11px] text-[--edu-text-faint]">{timeAgo(notification.created_at)}</span>
              </div>
              <span className="text-[13px] font-medium text-[--edu-text]">{notification.titulo}</span>
              {notification.cuerpo ? (
                <span className="line-clamp-2 text-[12px] text-[--edu-text-muted]">{notification.cuerpo.slice(0, 80)}</span>
              ) : null}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
