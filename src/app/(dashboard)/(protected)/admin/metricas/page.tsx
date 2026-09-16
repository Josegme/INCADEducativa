import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CsvExportButton } from "@/components/admin/CsvExportButton";
import { createClient } from "@/lib/supabase/server";

export default async function AdminMetricasPage() {
  const supabase = await createClient();

  const [{ data: courses }, { data: careers }, { data: enrollments }, { data: certificates }] = await Promise.all([
    supabase.from("courses").select("id, titulo, carrera_id, estado").order("titulo", { ascending: true }),
    supabase.from("careers").select("id, nombre"),
    supabase.from("enrollments").select("user_id, course_id, estado, progreso_pct"),
    supabase.from("certificates").select("course_id"),
  ]);

  const careerNameById = new Map((careers ?? []).map((c) => [c.id as string, c.nombre as string]));
  const enrollmentRows = enrollments ?? [];
  const certificateRows = certificates ?? [];

  const certCountByCourse = new Map<string, number>();
  for (const c of certificateRows) {
    certCountByCourse.set(c.course_id as string, (certCountByCourse.get(c.course_id as string) ?? 0) + 1);
  }

  const courseMetrics = (courses ?? []).map((course) => {
    const rows = enrollmentRows.filter((e) => e.course_id === course.id);
    const inscriptos = rows.length;
    const progresoPromedio = inscriptos > 0 ? Math.round(rows.reduce((sum, r) => sum + r.progreso_pct, 0) / inscriptos) : 0;
    const completados = rows.filter((r) => r.estado === "completado").length;
    return {
      id: course.id,
      titulo: course.titulo,
      carrera: course.carrera_id ? careerNameById.get(course.carrera_id) ?? "—" : "—",
      inscriptos,
      progresoPromedio,
      completados,
      certificados: certCountByCourse.get(course.id) ?? 0,
    };
  });

  const alumnosActivos = new Set(enrollmentRows.filter((e) => e.estado === "activo").map((e) => e.user_id)).size;
  const progresoGlobal =
    enrollmentRows.length > 0
      ? Math.round(enrollmentRows.reduce((sum, r) => sum + r.progreso_pct, 0) / enrollmentRows.length)
      : 0;
  const totalCertificados = certificateRows.length;

  const csvRows = courseMetrics.map((m) => [
    m.titulo,
    m.carrera,
    m.inscriptos,
    `${m.progresoPromedio}%`,
    m.completados,
    m.certificados,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Métricas académicas</h1>
          <p className="text-sm text-[--edu-text-muted]">
            Progreso y engagement de alumnos por curso, plataforma educativa completa.
          </p>
        </div>
        <CsvExportButton
          headers={["Curso", "Carrera", "Inscriptos", "Progreso promedio", "Completados", "Certificados"]}
          rows={csvRows}
          filename="metricas-academicas.csv"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
          <p className="text-[12px] text-[--edu-text-muted]">Alumnos activos</p>
          <p className="text-[24px] font-semibold text-white">{alumnosActivos}</p>
        </div>
        <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
          <p className="text-[12px] text-[--edu-text-muted]">Progreso promedio global</p>
          <p className="text-[24px] font-semibold text-white">{progresoGlobal}%</p>
        </div>
        <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
          <p className="text-[12px] text-[--edu-text-muted]">Certificados emitidos</p>
          <p className="text-[24px] font-semibold text-white">{totalCertificados}</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Curso</TableHead>
            <TableHead>Carrera</TableHead>
            <TableHead>Inscriptos</TableHead>
            <TableHead>Progreso promedio</TableHead>
            <TableHead>Completados</TableHead>
            <TableHead>Certificados</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courseMetrics.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{m.titulo}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{m.carrera}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{m.inscriptos}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{m.progresoPromedio}%</TableCell>
              <TableCell className="text-[--edu-text-muted]">{m.completados}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{m.certificados}</TableCell>
            </TableRow>
          ))}
          {courseMetrics.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-[--edu-text-muted]">
                Todavía no hay cursos cargados.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
