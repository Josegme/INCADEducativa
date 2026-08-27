import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SpaceModal } from "@/components/admin/SpaceModal";
import { SpaceActiveToggle } from "@/components/admin/SpaceActiveToggle";
import { createClient } from "@/lib/supabase/server";
import { SPACE_TYPE_LABEL, type LocationRow, type SpaceRow } from "@/modules/admin/coworking";

export default async function AdminCoworkingEspaciosPage() {
  const supabase = await createClient();

  const { data: locations } = await supabase.from("locations").select("id, nombre, direccion, activa").order("nombre", { ascending: true });

  const { data: spaces } = await supabase
    .from("spaces")
    .select("id, location_id, nombre, tipo, capacidad, precio_hora, descripcion, imagen_url, activo")
    .order("nombre", { ascending: true });

  const locationRows = (locations ?? []) as LocationRow[];
  const nameByLocation = new Map(locationRows.map((l) => [l.id, l.nombre]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Espacios de Coworking</h1>
          <p className="text-sm text-[--edu-text-muted]">Hot desks, salas de reunión y aulas por sede.</p>
        </div>
        {locationRows.length > 0 ? (
          <SpaceModal locations={locationRows} />
        ) : (
          <span className="text-[13px] text-[--edu-text-muted]">Cargá una sede primero</span>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Sede</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Capacidad</TableHead>
            <TableHead>Precio/hora</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {((spaces ?? []) as SpaceRow[]).map((space) => (
            <TableRow key={space.id}>
              <TableCell>{space.nombre}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{nameByLocation.get(space.location_id) ?? "—"}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{SPACE_TYPE_LABEL[space.tipo]}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{space.capacidad}</TableCell>
              <TableCell className="text-[--edu-text-muted]">${space.precio_hora}</TableCell>
              <TableCell>
                <Badge state={space.activo ? "completed" : "locked"}>{space.activo ? "Activo" : "Inactivo"}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <SpaceModal locations={locationRows} space={space} />
                  <SpaceActiveToggle spaceId={space.id} activo={space.activo} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {(spaces ?? []).length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-[--edu-text-muted]">
                Todavía no hay espacios cargados.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
