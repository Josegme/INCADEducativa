import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MaintenanceIncidentModal } from "@/components/admin/MaintenanceIncidentModal";
import { ResolveMaintenanceIncidentButton } from "@/components/admin/ResolveMaintenanceIncidentButton";
import { createClient } from "@/lib/supabase/server";
import type { MaintenanceIncidentRow, SpaceRow } from "@/modules/admin/coworking";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminMantenimientoPage() {
  const supabase = await createClient();

  const [{ data: spaces }, { data: incidents }] = await Promise.all([
    supabase
      .from("spaces")
      .select("id, location_id, nombre, tipo, capacidad, precio_hora, descripcion, imagen_url, activo")
      .order("nombre", { ascending: true }),
    supabase
      .from("maintenance_incidents")
      .select("id, space_id, descripcion, resuelta, created_at, resuelta_at")
      .order("created_at", { ascending: false }),
  ]);

  const spaceRows = (spaces ?? []) as SpaceRow[];
  const nameBySpace = new Map(spaceRows.map((s) => [s.id, s.nombre]));
  const incidentRows = (incidents ?? []) as MaintenanceIncidentRow[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Mantenimiento — Coworking</h1>
          <p className="text-sm text-[--edu-text-muted]">Incidencias reportadas por espacio.</p>
        </div>
        <MaintenanceIncidentModal spaces={spaceRows} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Espacio</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Reportada</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidentRows.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell>{nameBySpace.get(incident.space_id) ?? "—"}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{incident.descripcion}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{formatFecha(incident.created_at)}</TableCell>
              <TableCell>
                <Badge state={incident.resuelta ? "completed" : "pending"}>
                  {incident.resuelta ? "Resuelta" : "Pendiente"}
                </Badge>
              </TableCell>
              <TableCell>{!incident.resuelta ? <ResolveMaintenanceIncidentButton incidentId={incident.id} /> : null}</TableCell>
            </TableRow>
          ))}
          {incidentRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-[--edu-text-muted]">
                No hay incidencias reportadas.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
