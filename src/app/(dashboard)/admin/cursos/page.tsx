import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CourseModal } from "@/components/admin/CourseModal";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { createClient } from "@/lib/supabase/server";
import { COURSE_LEVEL_LABEL, type CourseRow } from "@/modules/admin/courses";

const ESTADO_BADGE: Record<CourseRow["estado"], "active" | "pending" | "completed" | "locked"> = {
  borrador: "locked",
  revision: "pending",
  publicado: "completed",
  archivado: "locked",
};

export default async function AdminCursosPage() {
  const supabase = await createClient();
  const [{ data: courses }, { data: careers }, { data: docentes }] = await Promise.all([
    supabase
      .from("courses")
      .select("id, titulo, slug, descripcion, carrera_id, docente_id, estado, precio, duracion_hs, nivel, es_gratuito")
      .order("created_at", { ascending: false }),
    supabase.from("careers").select("id, nombre").order("orden", { ascending: true }),
    supabase.from("users").select("id, nombre, apellido").or("role.eq.docente,can_teach.eq.true"),
  ]);

  const careerOptions = careers ?? [];
  const docenteOptions = docentes ?? [];
  const careerNameById = new Map(careerOptions.map((c) => [c.id as string, c.nombre as string]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Cursos</h1>
          <p className="text-sm text-[--edu-text-muted]">
            Registro de cursos del catálogo. La carga de módulos y clases se hace en un sprint aparte.
          </p>
        </div>
        <CourseModal careers={careerOptions} docentes={docenteOptions} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Carrera</TableHead>
            <TableHead>Nivel</TableHead>
            <TableHead>Gratuito</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {((courses ?? []) as CourseRow[]).map((course) => (
            <TableRow key={course.id}>
              <TableCell>{course.titulo}</TableCell>
              <TableCell className="text-[--edu-text-muted]">
                {course.carrera_id ? careerNameById.get(course.carrera_id) ?? "—" : "—"}
              </TableCell>
              <TableCell className="text-[--edu-text-muted]">{COURSE_LEVEL_LABEL[course.nivel]}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{course.es_gratuito ? "Sí" : "No"}</TableCell>
              <TableCell>
                <Badge state={ESTADO_BADGE[course.estado]}>{course.estado}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <CourseModal course={course} careers={careerOptions} docentes={docenteOptions} />
                  <PublishToggle courseId={course.id} estado={course.estado} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {(courses ?? []).length === 0 ? (
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
