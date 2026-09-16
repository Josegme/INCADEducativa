import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CsvExportButton } from "@/components/admin/CsvExportButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { createClient } from "@/lib/supabase/server";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdminLeadsPage() {
  const supabase = await createClient();

  const [{ data: leads }, { data: comunidad }] = await Promise.all([
    supabase
      .from("users")
      .select("id, nombre, apellido, email, created_at")
      .eq("role", "lead")
      .order("created_at", { ascending: false }),
    supabase
      .from("users")
      .select("id, nombre, apellido, email, created_at")
      .eq("role", "comunidad")
      .order("created_at", { ascending: false }),
  ]);

  const leadRows = leads ?? [];
  const comunidadRows = comunidad ?? [];
  const leadIds = leadRows.map((l) => l.id as string);

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

  const exportLeads = leadRows.map((l) => [
    `${l.nombre} ${l.apellido}`,
    l.email as string,
    (talleresByLead.get(l.id as string) ?? []).join("; "),
    formatFecha(l.created_at as string),
  ]);

  const exportComunidad = comunidadRows.map((u) => [
    `${u.nombre} ${u.apellido}`,
    u.email as string,
    formatFecha(u.created_at as string),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Marketing"
          description="Leads de talleres gratuitos y usuarios comunidad — exportables a CSV."
        />
        <div className="flex flex-wrap gap-2">
          <CsvExportButton
            headers={["Nombre", "Email", "Interés (talleres)", "Registrado"]}
            rows={exportLeads}
            filename="leads.csv"
          />
          <CsvExportButton
            headers={["Nombre", "Email", "Registrado"]}
            rows={exportComunidad}
            filename="comunidad.csv"
          />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-section font-semibold text-white">Leads ({leadRows.length})</h2>
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
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section font-semibold text-white">Comunidad ({comunidadRows.length})</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Registrado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comunidadRows.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  {u.nombre} {u.apellido}
                </TableCell>
                <TableCell className="text-[--edu-text-muted]">{u.email}</TableCell>
                <TableCell className="text-[--edu-text-muted]">{formatFecha(u.created_at as string)}</TableCell>
              </TableRow>
            ))}
            {comunidadRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-[--edu-text-muted]">
                  Todavía no hay usuarios comunidad.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
