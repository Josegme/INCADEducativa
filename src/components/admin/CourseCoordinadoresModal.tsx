"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { setCourseCoordinadoresAction } from "@/app/(dashboard)/(protected)/admin/actions/courseCoordinadorActions";

interface CoordinadorOption {
  id: string;
  nombre: string;
  apellido: string;
}

interface CourseCoordinadoresModalProps {
  courseId: string;
  courseTitulo: string;
  coordinadores: CoordinadorOption[];
  assignedIds: string[];
}

export function CourseCoordinadoresModal({
  courseId,
  courseTitulo,
  coordinadores,
  assignedIds,
}: CourseCoordinadoresModalProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set(assignedIds));
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function handleSave() {
    setIsLoading(true);
    setError(null);

    const result = await setCourseCoordinadoresAction(courseId, Array.from(selected));

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSelected(new Set(assignedIds));
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Asignar coordinadores">
          <Users className="h-4 w-4" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Coordinadores — {courseTitulo}</DialogTitle>
          <DialogDescription>
            Pueden cargar materiales adjuntos en las clases y ver el progreso de los alumnos, sin editar el contenido
            del curso.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        {coordinadores.length === 0 ? (
          <p className="text-[13px] text-[--edu-text-muted]">
            No hay usuarios con rol Coordinador todavía — convertí uno desde /admin/usuarios.
          </p>
        ) : (
          <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto rounded-md border-[0.5px] border-[--edu-border] p-2">
            {coordinadores.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-[13px] text-[--edu-text]">
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggle(c.id)}
                  className="h-4 w-4 rounded-sm border-[--edu-border] accent-[--inc-violet]"
                />
                {c.nombre} {c.apellido}
              </label>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" disabled={isLoading} onClick={handleSave}>
            {isLoading ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
