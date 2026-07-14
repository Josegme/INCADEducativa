import { Sparkles } from "lucide-react";

export interface PointsLogRow {
  id: string;
  puntos: number;
  motivo: string;
  created_at: string;
}

const MOTIVO_LABEL: Record<string, string> = {
  leccion_completada: "Clase completada",
  evaluacion_aprobada: "Evaluación aprobada",
  certificado_emitido: "Certificado obtenido",
};

export function PointsHistory({ total, rows }: { total: number; rows: PointsLogRow[] }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[--inc-violet]" aria-hidden />
        <h2 className="text-[13px] font-semibold text-[--edu-text]">Mis puntos</h2>
        <span className="ml-auto text-[16px] font-semibold text-white">{total}</span>
      </div>

      {rows.length === 0 ? (
        <p className="text-[13px] text-[--edu-text-muted]">Todavía no acumulaste puntos.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between text-[12px] text-[--edu-text-muted]">
              <span>{MOTIVO_LABEL[row.motivo] ?? row.motivo}</span>
              <span className="flex items-center gap-2">
                <span className="text-[--edu-success-text]">+{row.puntos}</span>
                <span className="text-[--edu-text-faint]">{new Date(row.created_at).toLocaleDateString("es-AR")}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
