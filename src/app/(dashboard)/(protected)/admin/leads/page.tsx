import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CsvExportButton } from "@/components/admin/CsvExportButton";
import { createClient } from "@/lib/supabase/server";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdminLeadsPage() {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("users")
    .select("id, nombre, apellido, email, created_at")
    .eq("role", "lead")
    .order("created_at", { ascending: false });

  const leadRows = leads ?? [];
  const leadIds = leadRows.map((l) => l.id as string);

  // "Área de interés" no es un campo propio del registro — se infiere de
  // los talleres a los que se anotó, más preciso que pedirle un texto
  // libre al registrarse y no agrega fricción al alta.
  const { data: inscripciones } = leadIds.length
    ? await supabase
        .from("taller_inscripciones")
        .select("user_id, talleres(titulo)")
        .in("user_id", leadIds)
    : { data: [] as Record<string, unknown>[] };

  const talleresByLead = new Map<string, string[]>();
  for (const row of inscripciones ?? []) {
    const list = talleresByLead.get(row.user_id as string) ?? [];
    const taller = row.talleres as unknown as { titulo: string } | null;
    if (taller?.titulo) list.push(taller.titulo);
    talleresByLead.set(row.user_id as string, list);
  }

  const exportRows = leadRows.map((l) => [
    `${l.nombre} ${l.apellido}`,
    l.email as string,
    (talleresByLead.get(l.id as string) ?? []).join("; "),
    formatFecha(l.created_at as string),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Leads</h1>
          <p className="text-sm text-[--edu-text-muted]">
            Visitantes registrados por un taller gratuito — base de marketing.
          </p>
        </div>
        <CsvExportButton
          headers={["Nombre", "Email", "Interés (talleres)", "Registrado"]}
          rows={exportRows}
          filename="leads.csv"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Interés (talleres)</TableHead>
            <TableHead>Registrado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leadRows.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                {lead.nombre} {lead.apellido}
              </TableCell>
              <TableCell className="text-[--edu-text-muted]">{lead.email}</TableCell>
              <TableCell className="text-[--edu-text-muted]">
                {(talleresByLead.get(lead.id as string) ?? []).join(", ") || "—"}
              </TableCell>
              <TableCell className="text-[--edu-text-muted]">{formatFecha(lead.created_at as string)}</TableCell>
            </TableRow>
          ))}
          {leadRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-[--edu-text-muted]">
                Todavía no hay leads registrados.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
