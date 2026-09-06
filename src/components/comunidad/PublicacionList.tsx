"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ocultarPublicacionAction } from "@/app/(dashboard)/(protected)/comunidad/actions";

export interface PublicacionListItem {
  id: string;
  autorId: string;
  autorNombre: string;
  autorApellido: string;
  carreraNombre: string | null;
  contenido: string;
  oculto: boolean;
  createdAt: string;
}

interface PublicacionListProps {
  publicaciones: PublicacionListItem[];
  isAdmin: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function PublicacionList({ publicaciones, isAdmin }: PublicacionListProps) {
  const [items, setItems] = React.useState(publicaciones);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  React.useEffect(() => setItems(publicaciones), [publicaciones]);

  async function handleToggleOcultar(id: string, ocultarNuevo: boolean) {
    setPendingId(id);
    const result = await ocultarPublicacionAction(id, ocultarNuevo);
    setPendingId(null);
    if (!result?.error) {
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, oculto: ocultarNuevo } : p)));
    }
  }

  if (items.length === 0) {
    return <p className="text-[13px] text-[--edu-text-muted]">Todavía no hay publicaciones acá.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((p) => (
        <div key={p.id} className="flex flex-col gap-1.5 rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-semibold text-white">
              {p.autorNombre} {p.autorApellido}
            </span>
            <Badge state={p.carreraNombre ? "active" : "locked"}>{p.carreraNombre ?? "Institucional"}</Badge>
            {p.oculto ? <Badge state="error">Oculta</Badge> : null}
            <span className="text-[11px] text-[--edu-text-faint]">{formatDate(p.createdAt)}</span>
          </div>

          <p className="whitespace-pre-wrap text-[13px] text-[--edu-text-muted]">{p.contenido}</p>

          {isAdmin ? (
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              disabled={pendingId === p.id}
              onClick={() => handleToggleOcultar(p.id, !p.oculto)}
            >
              {pendingId === p.id ? "Aplicando…" : p.oculto ? "Reactivar" : "Ocultar"}
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
