import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CouponModal } from "@/components/admin/CouponModal";
import { CouponActiveToggle } from "@/components/admin/CouponActiveToggle";
import { createClient } from "@/lib/supabase/server";
import type { CouponRow } from "@/modules/admin/coworking";

export default async function AdminCuponesPage() {
  const supabase = await createClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("id, codigo, descuento_pct, valido_desde, valido_hasta, usos_maximos, usos_actuales, activo")
    .order("created_at", { ascending: false });

  const couponRows = (coupons ?? []) as CouponRow[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Cupones — Coworking</h1>
          <p className="text-sm text-[--edu-text-muted]">Códigos de descuento para reservas (early bird, promociones).</p>
        </div>
        <CouponModal />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Descuento</TableHead>
            <TableHead>Vigencia</TableHead>
            <TableHead>Usos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {couponRows.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell className="font-mono">{coupon.codigo}</TableCell>
              <TableCell className="text-[--edu-text-muted]">{coupon.descuento_pct}%</TableCell>
              <TableCell className="text-[--edu-text-muted]">
                {coupon.valido_desde} → {coupon.valido_hasta}
              </TableCell>
              <TableCell className="text-[--edu-text-muted]">
                {coupon.usos_actuales}
                {coupon.usos_maximos ? ` / ${coupon.usos_maximos}` : ""}
              </TableCell>
              <TableCell>
                <Badge state={coupon.activo ? "completed" : "locked"}>{coupon.activo ? "Activo" : "Inactivo"}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <CouponModal coupon={coupon} />
                  <CouponActiveToggle couponId={coupon.id} activo={coupon.activo} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {couponRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-[--edu-text-muted]">
                Todavía no hay cupones cargados.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
