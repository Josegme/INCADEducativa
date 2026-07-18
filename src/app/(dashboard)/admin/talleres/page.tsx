import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TallerModal } from "@/components/admin/TallerModal";
import { TallerPublishToggle } from "@/components/admin/TallerPublishToggle";
import type { TallerEstado, TallerRow } from "@/modules/talleres/talleres";
import { TALLER_ESTADO_LABEL } from "@/modules/talleres/talleres";
import { createClient } from "@/lib/supabase/server";

const ESTADO_BADGE: Record<TallerEstado, NonNullable<BadgeProps["state"]>> = {
  borrador: "pending",
  publicado: "completed",
  cancelado: "locked",
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminTalleresPage() {
  const supabase = await createClient();
  const { data: talleres } = await supabase
    .from("talleres")
    .select("id, titulo, descripcion, fecha_inicio, duracion_minutos, link_virtual, grabacion_url, capacidad, estado")
    .order("fecha_inicio", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Talleres</h1>
          <p className="text-sm text-[--edu-text-muted]">Contenido en vivo autorado por Admin — sin rol Docente.</p>
        </div>
        <TallerModal />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {((talleres ?? []) as TallerRow[]).map((taller) => (
            <TableRow key={taller.id}>
              <TableCell>{taller.titulo}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{formatFecha(taller.fecha_inicio)}</TableCell>
              <TableCell>
                <Badge state={ESTADO_BADGE[taller.estado]}>{TALLER_ESTADO_LABEL[taller.estado]}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <TallerModal taller={taller} />
                  <TallerPublishToggle tallerId={taller.id} estado={taller.estado} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {(talleres ?? []).length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-[--edu-text-muted]">
                Todavía no hay talleres cargados.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
