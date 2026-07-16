import { RevenueFilterBar } from "@/components/admin/RevenueFilterBar";
import { RevenueExportButton } from "@/components/admin/RevenueExportButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { DISCOUNT_TYPE_LABEL, type RevenueRow } from "@/modules/admin/bookings";
import type { LocationRow } from "@/modules/admin/coworking";

function currentMonthIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// `periodo` es un date_trunc('month', ...) en UTC — formatear en zona local lo
// corre un mes cuando el offset es negativo (ej. Argentina), hay que fijar UTC.
function formatPeriodo(periodo: string) {
  return new Date(periodo).toLocaleDateString("es-AR", { year: "numeric", month: "long", timeZone: "UTC" });
}

interface PageProps {
  searchParams: { mes?: string; locationId?: string; tipoDescuento?: string };
}

export default async function AdminCoworkingIngresosPage({ searchParams }: PageProps) {
  const supabase = await createClient();

  const { data: locations } = await supabase.from("locations").select("id, nombre, direccion, activa").order("nombre", { ascending: true });
  const locationRows = (locations ?? []) as LocationRow[];

  const mes = searchParams.mes === "todos" ? undefined : searchParams.mes ?? currentMonthIso();

  let query = supabase
    .from("coworking_revenue")
    .select("periodo, location_id, sede, tipo_descuento, reservas_pagadas, ingresos")
    .order("periodo", { ascending: false });

  if (searchParams.locationId) query = query.eq("location_id", searchParams.locationId);
  if (searchParams.tipoDescuento) query = query.eq("tipo_descuento", searchParams.tipoDescuento);
  if (mes) {
    // date_trunc('month', ...) en la vista coworking_revenue trunca en UTC (timezone
    // por defecto de Postgres en Supabase) — el límite del filtro tiene que calcularse
    // en UTC también, si no un offset local (ej. Argentina UTC-3) deja fuera todas las
    // filas del mes por unas horas de diferencia.
    const [year, month] = mes.split("-").map(Number);
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 1));
    query = query.gte("periodo", monthStart.toISOString()).lt("periodo", monthEnd.toISOString());
  }

  const { data: revenue } = await query;
  const rows = (revenue ?? []) as RevenueRow[];

  const totalIngresos = rows.reduce((sum, r) => sum + Number(r.ingresos), 0);
  const totalReservas = rows.reduce((sum, r) => sum + Number(r.reservas_pagadas), 0);

  const csvRows = rows.map((r) => [
    formatPeriodo(r.periodo),
    r.sede,
    DISCOUNT_TYPE_LABEL[r.tipo_descuento],
    r.reservas_pagadas,
    r.ingresos,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Ingresos de Coworking</h1>
          <p className="text-sm text-[--edu-text-muted]">
            Panel financiero independiente del módulo educativo (`coworking_revenue`).
          </p>
        </div>
        <RevenueExportButton
          headers={["Período", "Sede", "Tipo", "Reservas pagadas", "Ingresos"]}
          rows={csvRows}
          filename={`coworking-ingresos-${mes ?? "todos"}.csv`}
        />
      </div>

      <RevenueFilterBar locations={locationRows} mes={mes} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
          <p className="text-[12px] text-[--edu-text-muted]">Ingresos totales</p>
          <p className="text-[24px] font-semibold text-white">${totalIngresos.toLocaleString("es-AR")}</p>
        </div>
        <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
          <p className="text-[12px] text-[--edu-text-muted]">Reservas pagadas</p>
          <p className="text-[24px] font-semibold text-white">{totalReservas}</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Período</TableHead>
            <TableHead>Sede</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Reservas pagadas</TableHead>
            <TableHead>Ingresos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={`${r.location_id}-${r.tipo_descuento}-${r.periodo}-${i}`}>
              <TableCell className="text-[--edu-text-muted]">{formatPeriodo(r.periodo)}</TableCell>
              <TableCell>{r.sede}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{DISCOUNT_TYPE_LABEL[r.tipo_descuento]}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{r.reservas_pagadas}</TableCell>
              <TableCell className="text-[--edu-text-muted]">${Number(r.ingresos).toLocaleString("es-AR")}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-[--edu-text-muted]">
                No hay ingresos para este filtro.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
