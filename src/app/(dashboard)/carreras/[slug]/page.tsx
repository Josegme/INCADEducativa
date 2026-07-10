import { notFound } from "next/navigation";

import { CareerBlockedCTA } from "@/components/educativa/CareerBlockedCTA";
import { CareerMap } from "@/components/educativa/CareerMap";
import { createClient } from "@/lib/supabase/server";
import type { CatalogCourse, CourseLevel } from "@/modules/educativa/catalog";

export default async function CareerDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();

  const { data: career } = await supabase
    .from("careers")
    .select("id, slug, nombre, descripcion")
    .eq("slug", params.slug)
    .eq("activa", true)
    .single();

  if (!career) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("users").select("role").eq("id", user.id).single()
    : { data: null };

  const isAlumno = profile?.role === "alumno";

  if (!isAlumno) {
    return <CareerBlockedCTA career={career} />;
  }

  const { data: courseRows } = await supabase
    .from("courses")
    .select("id, slug, titulo, descripcion, nivel, duracion_hs, es_gratuito")
    .eq("carrera_id", career.id)
    .eq("estado", "publicado")
    .order("created_at", { ascending: true });

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
    carrera: null,
    progresoPct: progresoByCourse.get(row.id as string),
  }));

  return <CareerMap career={career} courses={courses} />;
}
