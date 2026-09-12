import { Award } from "lucide-react";

import { CertificateCard } from "@/components/educativa/CertificateCard";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { CERTIFICATE_BUCKET } from "@/lib/certificates";
import { createClient } from "@/lib/supabase/server";

export default async function CertificadosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: certificates }, { data: careerCertificates }] = user
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
      ])
    : [{ data: [] }, { data: [] }];

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

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <PageHeader
        title="Mis certificados"
        description="Certificados emitidos al completar un curso. Compartí el enlace de verificación pública."
      />

      {cards.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Todavía no tenés certificados"
          description="Completá un curso y sus evaluaciones para obtener un certificado con QR verificable."
          actionHref="/cursos"
          actionLabel="Ver cursos"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {cards.map((card) => (
            <CertificateCard
              key={card.id}
              cursoTitulo={card.cursoTitulo}
              emitidoAt={card.emitidoAt}
              estado={card.estado}
              downloadUrl={card.downloadUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
