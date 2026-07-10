import { CourseCard } from "@/components/educativa/CourseCard";
import { FilterBar } from "@/components/educativa/FilterBar";
import { createClient } from "@/lib/supabase/server";
import type { CatalogCourse, CourseLevel } from "@/modules/educativa/catalog";

interface CursosPageProps {
  searchParams: { carrera?: string; nivel?: string };
}

export default async function CursosPage({ searchParams }: CursosPageProps) {
  const supabase = await createClient();

  const { data: careers } = await supabase
    .from("careers")
    .select("id, nombre, slug, descripcion")
    .eq("activa", true)
    .order("orden", { ascending: true });

  const careerBySlug = new Map((careers ?? []).map((c) => [c.slug, c]));
  const selectedCareer = searchParams.carrera ? careerBySlug.get(searchParams.carrera) : undefined;
  const nivel = searchParams.nivel as CourseLevel | undefined;

  let query = supabase
    .from("courses")
    .select("id, slug, titulo, descripcion, nivel, duracion_hs, es_gratuito, carrera:careers(id, nombre, slug, descripcion)")
    .eq("estado", "publicado");

  if (selectedCareer) {
    query = query.eq("carrera_id", selectedCareer.id);
  }
  if (nivel) {
    query = query.eq("nivel", nivel);
  }

  const { data: courseRows } = await query;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const courseIds = (courseRows ?? []).map((c) => c.id as string);
  const { data: enrollments } =
    user && courseIds.length > 0
      ? await supabase.from("enrollments").select("course_id, progreso_pct").eq("user_id", user.id).in("course_id", courseIds)
      : { data: [] as { course_id: string; progreso_pct: number }[] };

  const progresoByCourse = new Map((enrollments ?? []).map((e) => [e.course_id as string, e.progreso_pct as number]));

  const courses: CatalogCourse[] = (courseRows ?? []).map((row) => ({
    id: row.id as string,
    slug: row.slug as string,
    titulo: row.titulo as string,
    descripcion: row.descripcion as string | null,
    nivel: row.nivel as CourseLevel,
    duracionHs: row.duracion_hs as number | null,
    esGratuito: row.es_gratuito as boolean,
    carrera:
      (row.carrera as unknown as { id: string; nombre: string; slug: string; descripcion: string | null } | null) ??
      null,
    progresoPct: progresoByCourse.get(row.id as string),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Cursos</h1>
        <p className="text-sm text-[--edu-text-muted]">Catálogo de cursos disponibles en INCADEducativa.</p>
      </div>

      <FilterBar careers={(careers ?? []).map((c) => ({ slug: c.slug, nombre: c.nombre }))} />

      {courses.length === 0 ? (
        <p className="text-sm text-[--edu-text-muted]">No hay cursos para este filtro.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
