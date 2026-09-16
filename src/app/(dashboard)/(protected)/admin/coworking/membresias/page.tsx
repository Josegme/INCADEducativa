import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MembershipPlanModal } from "@/components/admin/MembershipPlanModal";
import { MembershipPlanActiveToggle } from "@/components/admin/MembershipPlanActiveToggle";
import { createClient } from "@/lib/supabase/server";
import { MEMBERSHIP_PLAN_TYPE_LABEL, type MembershipPlanRow } from "@/modules/admin/membershipPlans";

export default async function AdminCoworkingMembresiasPage() {
  const supabase = await createClient();

  const { data: plans } = await supabase
    .from("membership_plans")
    .select("id, tipo, nombre, precio, creditos_incluidos, activo")
    .order("nombre", { ascending: true });

  const planRows = (plans ?? []) as MembershipPlanRow[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Planes de membresía</h1>
          <p className="text-sm text-[--edu-text-muted]">Membresías mensuales/anuales de Coworking, con créditos incluidos.</p>
        </div>
        <MembershipPlanModal />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Créditos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {planRows.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell>{plan.nombre}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{MEMBERSHIP_PLAN_TYPE_LABEL[plan.tipo]}</TableCell>
              <TableCell className="text-[--edu-text-muted]">${plan.precio}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{plan.creditos_incluidos}</TableCell>
              <TableCell>
                <Badge state={plan.activo ? "completed" : "locked"}>{plan.activo ? "Activo" : "Inactivo"}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <MembershipPlanModal plan={plan} />
                  <MembershipPlanActiveToggle planId={plan.id} activo={plan.activo} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {planRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-[--edu-text-muted]">
                Todavía no hay planes de membresía cargados.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
