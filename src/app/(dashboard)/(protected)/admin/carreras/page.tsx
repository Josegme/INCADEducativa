import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CareerModal } from "@/components/admin/CareerModal";
import { createClient } from "@/lib/supabase/server";
import type { CareerRow } from "@/modules/admin/careers";

export default async function AdminCarrerasPage() {
  const supabase = await createClient();
  const { data: careers } = await supabase
    .from("careers")
    .select("id, nombre, slug, descripcion, imagen_url, activa, orden")
    .order("orden", { ascending: true });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Carreras</h1>
          <p className="text-sm text-[--edu-text-muted]">Programas visibles en el catálogo público.</p>
        </div>
        <CareerModal />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {((careers ?? []) as CareerRow[]).map((career) => (
            <TableRow key={career.id}>
              <TableCell>{career.nombre}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{career.slug}</TableCell>
              <TableCell>
                <Badge state={career.activa ? "completed" : "locked"}>
                  {career.activa ? "Activa" : "Inactiva"}
                </Badge>
              </TableCell>
              <TableCell>
                <CareerModal career={career} />
              </TableCell>
            </TableRow>
          ))}
          {(careers ?? []).length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-[--edu-text-muted]">
                Todavía no hay carreras cargadas.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
