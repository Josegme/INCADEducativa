"use client";

import * as React from "react";

import { updateNotificationPrefsAction, type NotificationPrefs } from "@/app/(dashboard)/actions/notificationActions";

function ToggleButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="switch"
      aria-checked={active}
      aria-label={label}
      className={`flex items-center gap-2 rounded-md border-[0.5px] px-3 py-1.5 text-[13px] transition-colors ${
        active
          ? "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]"
          : "border-[--edu-border] text-[--edu-text-faint]"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-pill ${active ? "bg-[--inc-violet]" : "bg-white/20"}`}
        aria-hidden
      />
      {label}
    </button>
  );
}

interface NotificationPrefsToggleProps {
  initialPrefs: NotificationPrefs;
}

export function NotificationPrefsToggle({ initialPrefs }: NotificationPrefsToggleProps) {
  const [prefs, setPrefs] = React.useState(initialPrefs);
  const [isSaving, setIsSaving] = React.useState(false);

  async function toggle(key: keyof NotificationPrefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setIsSaving(true);
    await updateNotificationPrefsAction(next);
    setIsSaving(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-[13px] font-semibold text-[--edu-text]">Preferencias de notificación</h2>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border-[0.5px] border-[--edu-border] px-3 py-1.5 text-[13px] text-[--edu-text-faint]">
          In-app (siempre activo)
        </span>
        <ToggleButton active={prefs.email} label="Email" onClick={() => toggle("email")} />
        <ToggleButton active={prefs.whatsapp} label="WhatsApp" onClick={() => toggle("whatsapp")} />
        {isSaving ? <span className="text-[12px] text-[--edu-text-faint]">Guardando…</span> : null}
      </div>
    </div>
  );
}
