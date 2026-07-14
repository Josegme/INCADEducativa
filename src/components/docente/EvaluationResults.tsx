import { Badge } from "@/components/ui/badge";
import { ATTEMPT_STATE_LABEL, type AttemptState } from "@/modules/educativa/evaluationAttempt";

const RESULT_BADGE_STATE: Record<AttemptState, "active" | "completed" | "pending" | "error" | "locked"> = {
  bloqueada: "locked",
  disponible: "locked",
  en_curso: "pending",
  pendiente_correccion: "pending",
  aprobada: "completed",
  desaprobada: "error",
  corregida: "completed",
};

export interface ResultRow {
  attemptId: string;
  studentName: string;
  nota: number | null;
  aprobado: boolean | null;
  estado: AttemptState;
  createdAt: string;
}

/** `corregida` no dice si aprobó o no (el trigger apply_manual_correction, 003,
 * fija ese estado tanto si `aprobado` queda true como false) — para mostrar el
 * badge correcto hay que mirar `aprobado`, no solo `estado`. */
function displayState(row: ResultRow): AttemptState {
  if (row.estado === "corregida" && row.aprobado === false) return "desaprobada";
  return row.estado;
}

export function EvaluationResults({ rows }: { rows: ResultRow[] }) {
  const notasValidas = rows.filter((r) => r.nota !== null).map((r) => r.nota as number);
  const promedio = notasValidas.length > 0 ? Math.round(notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length) : null;

  if (rows.length === 0) {
    return <p className="text-[13px] text-[--edu-text-muted]">Todavía nadie rindió esta evaluación.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {promedio !== null ? (
        <span className="text-[13px] text-[--edu-text-muted]">
          Promedio del grupo: <span className="font-semibold text-white">{promedio}/100</span>
        </span>
      ) : null}

      <div className="overflow-x-auto rounded-lg border-[0.5px] border-[--edu-border]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b-[0.5px] border-[--edu-border] text-left text-[11px] uppercase tracking-[0.4px] text-[--edu-text-faint]">
              <th className="px-3 py-2">Alumno</th>
              <th className="px-3 py-2">Nota</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Último intento</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.attemptId} className="border-b-[0.5px] border-[--edu-border] last:border-0">
                <td className="px-3 py-2 text-[--edu-text]">{row.studentName}</td>
                <td className="px-3 py-2 text-[--edu-text]">{row.nota ?? "—"}</td>
                <td className="px-3 py-2">
                  <Badge state={RESULT_BADGE_STATE[displayState(row)]}>{ATTEMPT_STATE_LABEL[displayState(row)]}</Badge>
                </td>
                <td className="px-3 py-2 text-[--edu-text-faint]">{new Date(row.createdAt).toLocaleDateString("es-AR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
