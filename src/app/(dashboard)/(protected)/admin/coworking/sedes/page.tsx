import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LocationModal } from "@/components/admin/LocationModal";
import { LocationActiveToggle } from "@/components/admin/LocationActiveToggle";
import { createClient } from "@/lib/supabase/server";
import type { LocationRow } from "@/modules/admin/coworking";

export default async function AdminCoworkingSedesPage() {
  const supabase = await createClient();
  const { data: locations } = await supabase.from("locations").select("id, nombre, direccion, activa").order("nombre", { ascending: true });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Sedes de Coworking</h1>
          <p className="text-sm text-[--edu-text-muted]">Sedes físicas visibles en la landing pública de Coworking.</p>
        </div>
        <LocationModal />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {((locations ?? []) as LocationRow[]).map((location) => (
            <TableRow key={location.id}>
              <TableCell>{location.nombre}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{location.direccion}</TableCell>
              <TableCell>
                <Badge state={location.activa ? "completed" : "locked"}>{location.activa ? "Activa" : "Inactiva"}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <LocationModal location={location} />
                  <LocationActiveToggle locationId={location.id} activa={location.activa} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {(locations ?? []).length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-[--edu-text-muted]">
                Todavía no hay sedes cargadas.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
