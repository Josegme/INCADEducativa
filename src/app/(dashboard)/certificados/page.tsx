import { CertificateCard } from "@/components/educativa/CertificateCard";
import { CERTIFICATE_BUCKET } from "@/lib/certificates";
import { createClient } from "@/lib/supabase/server";

export default async function CertificadosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: certificates } = user
    ? await supabase
        .from("certificates")
        .select("id, pdf_url, estado, emitido_at, course:courses(titulo)")
        .eq("user_id", user.id)
        .order("emitido_at", { ascending: false })
    : { data: [] };

  const cards = await Promise.all(
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

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Mis certificados</h1>
        <p className="text-sm text-[--edu-text-muted]">Certificados emitidos al completar un curso y todas sus evaluaciones.</p>
      </div>

      {cards.length === 0 ? (
        <p className="text-[13px] text-[--edu-text-muted]">Todavía no tenés certificados emitidos.</p>
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
