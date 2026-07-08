"use client";

import { History } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ROLE_LABEL, type RoleHistoryEntry } from "@/modules/admin/convertRole";

interface RoleHistoryTimelineProps {
  userName: string;
  entries: RoleHistoryEntry[];
  adminNameById: Record<string, string>;
}

export function RoleHistoryTimeline({ userName, entries, adminNameById }: RoleHistoryTimelineProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={`Ver historial de rol de ${userName}`}>
          <History className="h-4 w-4" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Historial de rol — {userName}</DialogTitle>
        </DialogHeader>
        {entries.length === 0 ? (
          <p className="text-[13px] text-[--edu-text-muted]">Sin conversiones registradas todavía.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {[...entries].reverse().map((entry, i) => (
              <li key={`${entry.at}-${i}`} className="flex flex-col gap-1 border-l-2 border-[--inc-violet] pl-3">
                <span className="flex items-center gap-2 text-[13px] text-[--edu-text]">
                  <Badge state="locked">{ROLE_LABEL[entry.from] ?? entry.from}</Badge>
                  {"→"}
                  <Badge state="active">{ROLE_LABEL[entry.to] ?? entry.to}</Badge>
                </span>
                <span className="text-[12px] text-[--edu-text-muted]">
                  {new Date(entry.at).toLocaleString("es-AR")} · por {adminNameById[entry.by] ?? "Admin"}
                </span>
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
