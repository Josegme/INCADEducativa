import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CsvExportButton } from "@/components/admin/CsvExportButton";
import { createClient } from "@/lib/supabase/server";

const ENROLLMENT_BADGE: Record<string, "active" | "completed" | "locked"> = {
  activo: "active",
  completado: "completed",
  abandonado: "locked",
};

export default async function DocenteAlumnosPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("id, titulo").eq("id", params.id).single();
  if (!course) {
    notFound();
  }

  const { data: students } = await supabase
    .from("course_students")
    .select("id, nombre, apellido, email, enrollment_estado, progreso_pct, fecha_inscripcion, fecha_completado")
    .eq("course_id", params.id)
    .order("progreso_pct", { ascending: false });

  const rows = students ?? [];
  const total = rows.length;
  const promedioProgreso = total > 0 ? Math.round(rows.reduce((sum, r) => sum + r.progreso_pct, 0) / total) : 0;
  const completados = rows.filter((r) => r.enrollment_estado === "completado").length;

  const csvRows = rows.map((r) => [
    `${r.nombre} ${r.apellido}`,
    r.email,
    `${r.progreso_pct}%`,
    r.enrollment_estado,
    new Date(r.fecha_inscripcion).toLocaleDateString("es-AR"),
    r.fecha_completado ? new Date(r.fecha_completado).toLocaleDateString("es-AR") : "—",
  ]);

  return (
    <div className="flex flex-col gap-4">
      <Link href={`/docente/cursos/${course.id}`} className="flex w-fit items-center gap-1 text-[13px] text-[--edu-text-muted] hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver al curso
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Alumnos — {course.titulo}</h1>
          <p className="text-sm text-[--edu-text-muted]">Progreso y estado de los alumnos inscriptos.</p>
        </div>
        <CsvExportButton
          headers={["Alumno", "Email", "Progreso", "Estado", "Inscripción", "Completado"]}
          rows={csvRows}
          filename={`alumnos-${course.titulo}.csv`}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
          <p className="text-[12px] text-[--edu-text-muted]">Alumnos inscriptos</p>
          <p className="text-[24px] font-semibold text-white">{total}</p>
        </div>
        <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
          <p className="text-[12px] text-[--edu-text-muted]">Progreso promedio</p>
          <p className="text-[24px] font-semibold text-white">{promedioProgreso}%</p>
        </div>
        <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
          <p className="text-[12px] text-[--edu-text-muted]">Completaron el curso</p>
          <p className="text-[24px] font-semibold text-white">{completados}</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Alumno</TableHead>
            <TableHead>Progreso</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Inscripción</TableHead>
            <TableHead>Completado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span>{r.nombre} {r.apellido}</span>
                  <span className="text-[12px] text-[--edu-text-faint]">{r.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-[--edu-surface-alt]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${r.progreso_pct}%`,
                        background: "linear-gradient(90deg, var(--inc-violet) 0%, var(--inc-magenta) 100%)",
                      }}
                    />
                  </div>
                  <span className="text-[12px] text-[--edu-text-muted]">{r.progreso_pct}%</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge state={ENROLLMENT_BADGE[r.enrollment_estado] ?? "locked"}>{r.enrollment_estado}</Badge>
              </TableCell>
              <TableCell className="text-[--edu-text-muted]">
                {new Date(r.fecha_inscripcion).toLocaleDateString("es-AR")}
              </TableCell>
              <TableCell className="text-[--edu-text-muted]">
                {r.fecha_completado ? new Date(r.fecha_completado).toLocaleDateString("es-AR") : "—"}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-[--edu-text-muted]">
                Todavía no hay alumnos inscriptos.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
