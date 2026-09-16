import { Award, BookOpen, GraduationCap } from "lucide-react";

import { CertificateCard } from "@/components/educativa/CertificateCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { CERTIFICATE_BUCKET } from "@/lib/certificates";
import { createClient } from "@/lib/supabase/server";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function CertificadosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: certificates },
    { data: careerCertificates },
    { data: completedEnrollments },
    { data: profile },
  ] = user
    ? await Promise.all([
        supabase
          .from("certificates")
          .select("id, pdf_url, estado, emitido_at, course:courses(titulo)")
          .eq("user_id", user.id)
          .order("emitido_at", { ascending: false }),
        supabase
          .from("career_certificates")
          .select("id, pdf_url, estado, emitido_at, carrera:careers(nombre)")
          .eq("user_id", user.id)
          .order("emitido_at", { ascending: false }),
        supabase
          .from("enrollments")
          .select("id, fecha_completado, progreso_pct, course:courses(titulo, slug)")
          .eq("user_id", user.id)
          .eq("estado", "completado")
          .order("fecha_completado", { ascending: false }),
        supabase.from("users").select("carrera_id").eq("id", user.id).single(),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: null }];

  let carreraAsignada: { nombre: string } | null = null;
  if (profile?.carrera_id) {
    const { data: carrera } = await supabase
      .from("careers")
      .select("nombre")
      .eq("id", profile.carrera_id)
      .maybeSingle();
    carreraAsignada = carrera;
  }

  const courseCards = await Promise.all(
    (certificates ?? []).map(async (cert) => {
      const course = cert.course as unknown as { titulo: string } | null;
      let downloadUrl: string | null = null;

      if (cert.pdf_url) {
        const { data: signed } = await supabase.storage.from(CERTIFICATE_BUCKET).createSignedUrl(cert.pdf_url, 3600);
        downloadUrl = signed?.signedUrl ?? null;
      }

      return {
        id: cert.id as string,
        cursoTitulo: course?.titulo ?? "Curso",
        emitidoAt: cert.emitido_at as string,
        estado: cert.estado as "emitido" | "revocado",
        downloadUrl,
      };
    })
  );

  const careerCards = await Promise.all(
    (careerCertificates ?? []).map(async (cert) => {
      const carrera = cert.carrera as unknown as { nombre: string } | null;
      let downloadUrl: string | null = null;

      if (cert.pdf_url) {
        const { data: signed } = await supabase.storage.from(CERTIFICATE_BUCKET).createSignedUrl(cert.pdf_url, 3600);
        downloadUrl = signed?.signedUrl ?? null;
      }

      return {
        id: cert.id as string,
        cursoTitulo: `Especialización — ${carrera?.nombre ?? "Carrera"}`,
        emitidoAt: cert.emitido_at as string,
        estado: cert.estado as "emitido" | "revocado",
        downloadUrl,
      };
    })
  );

  const cards = [...careerCards, ...courseCards];
  const hasLogros =
    cards.length > 0 || (completedEnrollments ?? []).length > 0 || Boolean(carreraAsignada);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Mis logros"
        description="Certificados, cursos completados y carrera asignada en un solo lugar."
      />

      {!hasLogros ? (
        <EmptyState
          icon={Award}
          title="Todavía no tenés logros"
          description="Completá un curso y sus evaluaciones para obtener un certificado con QR verificable."
          actionHref="/cursos"
          actionLabel="Ver cursos"
        />
      ) : (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-section font-semibold text-white">Certificados</h2>
            {cards.length === 0 ? (
              <p className="text-body text-[--edu-text-muted]">
                Aún no emitiste certificados. Al completar un curso con examen final aprobás el PDF.
              </p>
            ) : (
              cards.map((card) => (
                <CertificateCard
                  key={card.id}
                  cursoTitulo={card.cursoTitulo}
                  emitidoAt={card.emitidoAt}
                  estado={card.estado}
                  downloadUrl={card.downloadUrl}
                />
              ))
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="flex items-center gap-2 text-section font-semibold text-white">
              <BookOpen className="h-4 w-4 text-[--inc-violet-text]" aria-hidden />
              Cursos completados
            </h2>
            {(completedEnrollments ?? []).length === 0 ? (
              <p className="text-body text-[--edu-text-muted]">Ningún curso marcado como completado todavía.</p>
            ) : (
              (completedEnrollments ?? []).map((row) => {
                const course = row.course as unknown as { titulo: string; slug: string } | null;
                return (
                  <Card key={row.id as string} className="flex items-center justify-between gap-3 p-3">
                    <div>
                      <p className="text-body font-medium text-white">{course?.titulo ?? "Curso"}</p>
                      <p className="text-caption text-[--edu-text-muted]">
                        {row.fecha_completado
                          ? `Completado ${formatFecha(row.fecha_completado as string)}`
                          : "Completado"}
                      </p>
                    </div>
                    <Badge state="completed">{row.progreso_pct as number}%</Badge>
                  </Card>
                );
              })
            )}
          </section>

          {carreraAsignada ? (
            <section className="flex flex-col gap-2">
              <h2 className="flex items-center gap-2 text-section font-semibold text-white">
                <GraduationCap className="h-4 w-4 text-[--inc-violet-text]" aria-hidden />
                Carrera
              </h2>
              <Card className="p-3">
                <p className="text-body font-medium text-white">{carreraAsignada.nombre}</p>
                <p className="text-caption text-[--edu-text-muted]">
                  Matrícula presencial asignada por administración (ADR-15).
                </p>
              </Card>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
