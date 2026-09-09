import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CatalogPlanModal } from "@/components/admin/CatalogPlanModal";
import { CatalogPlanActiveToggle } from "@/components/admin/CatalogPlanActiveToggle";
import { createClient } from "@/lib/supabase/server";
import type { CatalogPlanRow } from "@/modules/admin/catalogPlans";

export default async function AdminSuscripcionesPage() {
  const supabase = await createClient();

  const { data: plans } = await supabase
    .from("catalogo_planes")
    .select("id, nombre, precio, activo")
    .order("nombre", { ascending: true });

  const planRows = (plans ?? []) as CatalogPlanRow[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Planes de suscripción</h1>
          <p className="text-sm text-[--edu-text-muted]">Suscripción mensual al catálogo educativo (Etapa 3).</p>
        </div>
        <CatalogPlanModal />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {planRows.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell>{plan.nombre}</TableCell>
              <TableCell className="text-[--edu-text-muted]">${plan.precio}</TableCell>
              <TableCell>
                <Badge state={plan.activo ? "completed" : "locked"}>{plan.activo ? "Activo" : "Inactivo"}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <CatalogPlanModal plan={plan} />
                  <CatalogPlanActiveToggle planId={plan.id} activo={plan.activo} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {planRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-[--edu-text-muted]">
                Todavía no hay planes de suscripción cargados.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
