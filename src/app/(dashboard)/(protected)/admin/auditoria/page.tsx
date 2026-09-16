import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";

const ENTIDAD_LABEL: Record<string, string> = {
  users: "Usuarios",
  courses: "Cursos",
  careers: "Carreras",
  talleres: "Talleres",
  locations: "Sedes Coworking",
  spaces: "Espacios Coworking",
  bookings: "Reservas Coworking",
  membership_plans: "Planes de membresía",
  feature_flags: "Feature flags",
  tutorias: "Tutorías",
};

export default async function AdminAuditoriaPage({
  searchParams,
}: {
  searchParams: { entidad?: string };
}) {
  const supabase = await createClient();
  const entidadFiltro = searchParams.entidad ?? "";

  let query = supabase
    .from("audit_log")
    .select("id, user_id, accion, entidad, entidad_id, detalle, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (entidadFiltro) {
    query = query.eq("entidad", entidadFiltro);
  }

  const { data: rows } = await query;

  const actorIds = Array.from(new Set((rows ?? []).map((r) => r.user_id).filter((id): id is string => Boolean(id))));
  const { data: actors } =
    actorIds.length > 0
      ? await supabase.from("users").select("id, nombre, apellido").in("id", actorIds)
      : { data: [] as { id: string; nombre: string; apellido: string }[] };
  const actorNameById = new Map((actors ?? []).map((a) => [a.id as string, `${a.nombre} ${a.apellido}`]));

  const entidades = Array.from(new Set((rows ?? []).map((r) => r.entidad)));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Log de auditoría</h1>
        <p className="text-sm text-[--edu-text-muted]">
          Últimas 200 acciones administrativas del sistema. Ledger append-only — no se puede
          editar ni borrar.
        </p>
      </div>

      <form className="flex items-center gap-2" method="get">
        <select
          name="entidad"
          defaultValue={entidadFiltro}
          className="h-9 rounded-[10px] border border-[--edu-border] bg-[--edu-surface-alt] px-3 text-[13px] text-[--edu-text]"
        >
          <option value="">Todas las entidades</option>
          {entidades.map((e) => (
            <option key={e} value={e}>
              {ENTIDAD_LABEL[e] ?? e}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm">
          Filtrar
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Quién</TableHead>
            <TableHead>Acción</TableHead>
            <TableHead>Entidad</TableHead>
            <TableHead>Detalle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(rows ?? []).map((row) => (
            <TableRow key={row.id}>
              <TableCell>{new Date(row.created_at).toLocaleString("es-AR")}</TableCell>
              <TableCell>{row.user_id ? actorNameById.get(row.user_id) ?? "—" : "—"}</TableCell>
              <TableCell>
                <Badge state="pending">{row.accion}</Badge>
              </TableCell>
              <TableCell>{ENTIDAD_LABEL[row.entidad] ?? row.entidad}</TableCell>
              <TableCell className="max-w-xs truncate text-[12px] text-[--edu-text-muted]">
                {row.detalle ? JSON.stringify(row.detalle) : "—"}
              </TableCell>
            </TableRow>
          ))}
          {(rows ?? []).length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-[--edu-text-muted]">
                Todavía no hay acciones registradas.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
