import { NotificationBanner } from "@/components/ui/notification-banner";

export interface BarChartRow {
  label: string;
  value: number;
}

interface OccupancyBarChartProps {
  title: string;
  subtitle?: string;
  rows: BarChartRow[];
  valueSuffix?: string;
}

/**
 * Barra horizontal simple, un solo color (mismo gradiente que Progress) —
 * no hace falta paleta categórica porque es una sola serie. Cada fila ya
 * muestra label + valor en texto, así que la data nunca depende solo del
 * ancho de la barra (equivalente a la "vista de tabla" para una lista de
 * este tamaño). El tooltip nativo (`title`) es la interacción mínima —
 * se documenta como simplificación frente a un tooltip custom con crosshair.
 */
export function OccupancyBarChart({ title, subtitle, rows, valueSuffix = "" }: OccupancyBarChartProps) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div>
      <h2 className="mb-1 text-[15px] font-semibold text-white">{title}</h2>
      {subtitle ? <p className="mb-2 text-[12px] text-[--edu-text-muted]">{subtitle}</p> : null}
      {rows.length === 0 ? (
        <NotificationBanner type="info">No hay datos suficientes todavía.</NotificationBanner>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3" title={`${r.label}: ${r.value}${valueSuffix}`}>
              <span className="w-28 shrink-0 truncate text-[12px] text-[--edu-text-muted]">{r.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[--edu-surface-alt]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(4, Math.round((r.value / max) * 100))}%`,
                    background: "linear-gradient(90deg, var(--inc-violet) 0%, var(--inc-magenta) 100%)",
                  }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-[12px] text-white">
                {r.value}
                {valueSuffix}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
