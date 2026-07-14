import { Award, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export interface CertificateCardProps {
  cursoTitulo: string;
  emitidoAt: string;
  estado: "emitido" | "revocado";
  downloadUrl: string | null;
}

export function CertificateCard({ cursoTitulo, emitidoAt, estado, downloadUrl }: CertificateCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
      <Award className="h-6 w-6 shrink-0 text-[--edu-gold]" aria-hidden />
      <div className="flex flex-1 flex-col">
        <span className="text-[14px] font-semibold text-white">{cursoTitulo}</span>
        <span className="text-[12px] text-[--edu-text-faint]">
          Emitido el {new Date(emitidoAt).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
        </span>
      </div>
      <Badge state={estado === "emitido" ? "gold" : "error"}>{estado === "emitido" ? "Emitido" : "Revocado"}</Badge>
      {downloadUrl ? (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 rounded-md border-[0.5px] border-[--inc-violet-border-strong] px-3 py-1.5 text-[13px] text-[--inc-violet] hover:bg-[--inc-violet-subtle]"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          Descargar
        </a>
      ) : null}
    </div>
  );
}
