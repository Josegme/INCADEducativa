import { ShieldCheck, ShieldX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

interface VerifyCertificateRow {
  alumno_nombre: string;
  alumno_apellido: string;
  curso_titulo: string;
  emitido_at: string;
  estado: "emitido" | "revocado";
}

interface VerifyCareerCertificateRow {
  alumno_nombre: string;
  alumno_apellido: string;
  carrera_nombre: string;
  emitido_at: string;
  estado: "emitido" | "revocado";
}

export default async function VerifyCertificatePage({ params }: { params: { uuid: string } }) {
  const supabase = await createClient();

  const { data } = await supabase.rpc("verify_certificate", { p_uuid: params.uuid });
  const certificate = (data as VerifyCertificateRow[] | null)?.[0];

  const { data: careerData } = certificate
    ? { data: null }
    : await supabase.rpc("verify_career_certificate", { p_uuid: params.uuid });
  const careerCertificate = (careerData as VerifyCareerCertificateRow[] | null)?.[0];

  const logroTitulo = certificate?.curso_titulo ?? careerCertificate?.carrera_nombre;
  const logroLabel = certificate ? "completó el curso" : "completó la carrera completa de";
  const resolved = certificate ?? careerCertificate;

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-edu-bg px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-[20px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-8 text-center">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[--inc-violet] text-[11px] font-semibold text-white">
          IN
        </div>

        {resolved ? (
          <>
            {resolved.estado === "emitido" ? (
              <ShieldCheck className="h-10 w-10 text-[--edu-success]" aria-hidden />
            ) : (
              <ShieldX className="h-10 w-10 text-[--edu-danger]" aria-hidden />
            )}
            <Badge state={resolved.estado === "emitido" ? "completed" : "error"}>
              {resolved.estado === "emitido" ? "Certificado válido" : "Certificado revocado"}
            </Badge>
            <div className="flex flex-col gap-1">
              <p className="text-[18px] font-semibold text-white">
                {resolved.alumno_nombre} {resolved.alumno_apellido}
              </p>
              <p className="text-sm text-[--edu-text-muted]">{logroLabel}</p>
              <p className="text-[16px] font-semibold text-[--inc-violet-text]">{logroTitulo}</p>
              <p className="mt-2 text-[12px] text-[--edu-text-faint]">
                Emitido el{" "}
                {new Date(resolved.emitido_at).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </>
        ) : (
          <>
            <ShieldX className="h-10 w-10 text-[--edu-danger]" aria-hidden />
            <p className="text-[16px] font-semibold text-white">Certificado no encontrado</p>
            <p className="text-sm text-[--edu-text-muted]">
              El código de verificación no corresponde a ningún certificado emitido por INCADEducativa.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
