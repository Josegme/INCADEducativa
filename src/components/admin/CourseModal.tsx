"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { slugify } from "@/lib/slugify";
import { COURSE_LEVELS, COURSE_LEVEL_LABEL, type CourseLevelValue, type CourseRow } from "@/modules/admin/courses";
import { createCourseAction, updateCourseAction } from "@/app/(dashboard)/admin/actions/courseActions";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

interface CourseModalProps {
  course?: CourseRow;
  careers: { id: string; nombre: string }[];
  docentes: { id: string; nombre: string; apellido: string }[];
  trigger?: React.ReactNode;
}

export function CourseModal({ course, careers, docentes, trigger }: CourseModalProps) {
  const router = useRouter();
  const isEdit = Boolean(course);
  const [open, setOpen] = React.useState(false);
  const [titulo, setTitulo] = React.useState(course?.titulo ?? "");
  const [slug, setSlug] = React.useState(course?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(isEdit);
  const [descripcion, setDescripcion] = React.useState(course?.descripcion ?? "");
  const [carreraId, setCarreraId] = React.useState(course?.carrera_id ?? "");
  const [docenteId, setDocenteId] = React.useState(course?.docente_id ?? "");
  const [nivel, setNivel] = React.useState<CourseLevelValue>(course?.nivel ?? "basico");
  const [duracionHs, setDuracionHs] = React.useState(course?.duracion_hs?.toString() ?? "");
  const [esGratuito, setEsGratuito] = React.useState(course?.es_gratuito ?? true);
  const [precio, setPrecio] = React.useState(course?.precio?.toString() ?? "0");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setTitulo(course?.titulo ?? "");
    setSlug(course?.slug ?? "");
    setSlugTouched(isEdit);
    setDescripcion(course?.descripcion ?? "");
    setCarreraId(course?.carrera_id ?? "");
    setDocenteId(course?.docente_id ?? "");
    setNivel(course?.nivel ?? "basico");
    setDuracionHs(course?.duracion_hs?.toString() ?? "");
    setEsGratuito(course?.es_gratuito ?? true);
    setPrecio(course?.precio?.toString() ?? "0");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    if (course) formData.set("id", course.id);
    formData.set("titulo", titulo);
    formData.set("slug", slug);
    formData.set("descripcion", descripcion);
    formData.set("carreraId", carreraId);
    formData.set("docenteId", docenteId);
    formData.set("nivel", nivel);
    formData.set("duracionHs", duracionHs);
    formData.set("esGratuito", String(esGratuito));
    formData.set("precio", precio);

    const result = course ? await updateCourseAction(formData) : await createCourseAction(formData);
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
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant={isEdit ? "outline" : "primary"} size="sm">
            {isEdit ? "Editar" : "Nuevo curso"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar curso — ${course?.titulo}` : "Nuevo curso"}</DialogTitle>
          <DialogDescription>
            Solo el registro del curso — módulos y clases se cargan en un sprint aparte.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="titulo" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Título
            </label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => {
                const value = e.target.value;
                setTitulo(value);
                if (!slugTouched) setSlug(slugify(value));
              }}
              required
              placeholder="Fundamentos de Marketing Digital"
            />
          </div>

          <div>
            <label htmlFor="slug" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Slug
            </label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              required
              placeholder="fundamentos-marketing-digital"
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Descripción
            </label>
            <Input
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Los pilares del marketing digital..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="carreraId" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Carrera
              </label>
              <select
                id="carreraId"
                value={carreraId}
                onChange={(e) => setCarreraId(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="" className="bg-[--edu-surface-raised]">
                  Sin carrera
                </option>
                {careers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[--edu-surface-raised]">
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="docenteId" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Docente
              </label>
              <select
                id="docenteId"
                value={docenteId}
                onChange={(e) => setDocenteId(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="" className="bg-[--edu-surface-raised]">
                  Sin asignar
                </option>
                {docentes.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[--edu-surface-raised]">
                    {d.nombre} {d.apellido}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="nivel" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Nivel
              </label>
              <select
                id="nivel"
                value={nivel}
                onChange={(e) => setNivel(e.target.value as CourseLevelValue)}
                className={SELECT_CLASS}
              >
                {COURSE_LEVELS.map((level) => (
                  <option key={level} value={level} className="bg-[--edu-surface-raised]">
                    {COURSE_LEVEL_LABEL[level]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="duracionHs" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Duración (hs)
              </label>
              <Input
                id="duracionHs"
                type="number"
                min={0}
                value={duracionHs}
                onChange={(e) => setDuracionHs(e.target.value)}
                placeholder="12"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-[13px] text-[--edu-text]">
            <input
              type="checkbox"
              checked={esGratuito}
              onChange={(e) => setEsGratuito(e.target.checked)}
              className="h-4 w-4 rounded-sm border-[--edu-border] accent-[--inc-violet]"
            />
            Es gratuito
          </label>

          {!esGratuito ? (
            <div>
              <label htmlFor="precio" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Precio
              </label>
              <Input
                id="precio"
                type="number"
                min={0}
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                required
              />
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Guardando…" : "Guardar curso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
