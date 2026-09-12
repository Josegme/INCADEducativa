import Link from "next/link";
import { Award, BookOpen, Play } from "lucide-react";

import { MembershipStatus } from "@/components/coworking/MembershipStatus";
import { RedeemPointsCard } from "@/components/coworking/RedeemPointsCard";
import { NotificationPrefsToggle } from "@/components/educativa/NotificationPrefsToggle";
import { PointsHistory } from "@/components/educativa/PointsHistory";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { NotificationPrefs } from "@/app/(dashboard)/actions/notificationActions";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";
import { getFlags } from "@/lib/flags";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const [user, profile, flags] = await Promise.all([getCurrentUser(), getCurrentProfile(), getFlags()]);

  const notificationPrefs = (profile?.notification_prefs as NotificationPrefs | undefined) ?? {
    email: true,
    whatsapp: true,
  };

  const { data: pointsRows } = user
    ? await supabase
        .from("points_log")
        .select("id, puntos, motivo, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8)
    : { data: [] };

  const { data: activeCourses } = user
    ? await supabase
        .from("enrollments")
        .select("progreso_pct, course:courses(id, slug, titulo)")
        .eq("user_id", user.id)
        .eq("estado", "activo")
        .order("fecha_inscripcion", { ascending: false })
        .limit(4)
    : { data: [] };

  const firstCourse = (activeCourses ?? [])[0]?.course as { slug?: string; titulo?: string } | null;
  const resumeHref = firstCourse?.slug ? `/cursos/${firstCourse.slug}` : "/cursos";
  const resumeTitle = firstCourse?.titulo;

  const { data: membership } =
    user && flags.coworking
      ? await supabase
          .from("memberships")
          .select("activa, fin, creditos_restantes")
          .eq("user_id", user.id)
          .eq("activa", true)
          .maybeSingle()
      : { data: null };

  const { data: certificates } = user
    ? await supabase.from("certificates").select("id").eq("user_id", user.id).eq("estado", "emitido")
    : { data: [] };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Hola, ${profile?.nombre ?? user?.email ?? "bienvenido"}`}
        description="Continuá donde dejaste y seguí sumando progreso."
      />

      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-[--inc-violet-text]">
            Continuá donde dejaste
          </p>
          <h2 className="mt-1 text-section font-semibold text-white">
            {resumeTitle ?? "Explorá el catálogo y empezá un curso"}
          </h2>
        </div>
        <Button asChild>
          <Link href={resumeHref}>
            <Play className="h-4 w-4" />
            {resumeTitle ? "Continuar curso" : "Ver cursos"}
          </Link>
        </Button>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-section font-semibold text-white">Tus cursos</h2>
          {(activeCourses ?? []).length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Todavía no estás inscripto"
              description="Entrá al catálogo y empezá un curso gratuito o contratá uno de pago."
              actionHref="/cursos"
              actionLabel="Ver catálogo"
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {(activeCourses ?? []).map((row) => {
                const course = row.course as { slug: string; titulo: string } | null;
                if (!course) return null;
                return (
                  <Link
                    key={course.slug}
                    href={`/cursos/${course.slug}`}
                    className="rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface] p-4 hover:border-[--edu-border-strong]"
                  >
                    <p className="text-body font-semibold text-white">{course.titulo}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Progress value={row.progreso_pct ?? 0} />
                      <span className="text-caption text-[--edu-text-muted]">{row.progreso_pct ?? 0}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <p className="text-caption text-[--edu-text-muted]">Certificados</p>
            <p className="mt-1 text-title font-semibold text-white">{certificates?.length ?? 0}</p>
            <Button asChild variant="ghost" size="sm" className="mt-2 px-0">
              <Link href="/certificados">
                <Award className="h-4 w-4" />
                Ver todos
              </Link>
            </Button>
          </Card>
          <PointsHistory total={profile?.puntos ?? 0} rows={pointsRows ?? []} />
        </div>
      </section>

      {flags.coworking ? (
        <MembershipStatus
          activa={membership?.activa ?? false}
          creditosRestantes={membership?.creditos_restantes ?? 0}
          fin={membership?.fin ?? null}
        />
      ) : null}
      {flags.coworking && user ? (
        <RedeemPointsCard puntos={profile?.puntos ?? 0} creditosActuales={profile?.coworking_creditos_canje ?? 0} />
      ) : null}
      {flags.coworking ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="text-body font-semibold text-white">Conocé Coworking INCADE</p>
            <p className="text-caption text-[--edu-text-muted]">Espacios y salas por hora en nuestras sedes de Posadas.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/servicios/coworking">Ver espacios</Link>
          </Button>
        </Card>
      ) : null}
      <NotificationPrefsToggle initialPrefs={notificationPrefs} />
    </div>
  );
}
