"use client";

import * as React from "react";
import { Bell } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { NotificationPanel } from "@/components/layout/NotificationPanel";

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const supabase = createClient();

    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("leida", false)
      .then(({ count }) => setUnreadCount(count ?? 0));

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => setUnreadCount((prev) => prev + 1)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  React.useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={
          unreadCount > 9
            ? "Notificaciones — 9+ sin leer"
            : unreadCount > 0
              ? `Notificaciones — ${unreadCount} sin leer`
              : "Notificaciones"
        }
        className="relative flex h-7 w-7 items-center justify-center rounded-md text-[--edu-text-muted] transition-colors hover:bg-white/5 hover:text-[--edu-text]"
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden />
        {unreadCount > 0 ? (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-[--inc-magenta] px-1 text-[10px] font-semibold text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <NotificationPanel
          onUnreadDelta={(delta) => setUnreadCount((prev) => Math.max(0, prev + delta))}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
