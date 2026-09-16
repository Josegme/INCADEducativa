"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NotificationBanner } from "@/components/ui/notification-banner";
import type { CouponRow } from "@/modules/admin/coworking";
import { createCouponAction, updateCouponAction } from "@/app/(dashboard)/(protected)/admin/actions/couponActions";

interface CouponModalProps {
  coupon?: CouponRow;
}

export function CouponModal({ coupon }: CouponModalProps) {
  const router = useRouter();
  const isEdit = Boolean(coupon);
  const [open, setOpen] = React.useState(false);
  const [codigo, setCodigo] = React.useState(coupon?.codigo ?? "");
  const [descuentoPct, setDescuentoPct] = React.useState(coupon?.descuento_pct?.toString() ?? "10");
  const [validoDesde, setValidoDesde] = React.useState(coupon?.valido_desde ?? "");
  const [validoHasta, setValidoHasta] = React.useState(coupon?.valido_hasta ?? "");
  const [usosMaximos, setUsosMaximos] = React.useState(coupon?.usos_maximos?.toString() ?? "");
  const [activo, setActivo] = React.useState(coupon?.activo ?? true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setCodigo(coupon?.codigo ?? "");
    setDescuentoPct(coupon?.descuento_pct?.toString() ?? "10");
    setValidoDesde(coupon?.valido_desde ?? "");
    setValidoHasta(coupon?.valido_hasta ?? "");
    setUsosMaximos(coupon?.usos_maximos?.toString() ?? "");
    setActivo(coupon?.activo ?? true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    if (coupon) formData.set("id", coupon.id);
    formData.set("codigo", codigo);
    formData.set("descuentoPct", descuentoPct);
    formData.set("validoDesde", validoDesde);
    formData.set("validoHasta", validoHasta);
    if (usosMaximos) formData.set("usosMaximos", usosMaximos);
    formData.set("activo", String(activo));

    const result = coupon ? await updateCouponAction(formData) : await createCouponAction(formData);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) reset(); }}>
      <DialogTrigger asChild>
        <Button variant={isEdit ? "outline" : "primary"} size="sm">
          {isEdit ? "Editar" : "Nuevo cupón"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar cupón — ${coupon?.codigo}` : "Nuevo cupón"}</DialogTitle>
          <DialogDescription>Código de descuento para reservas de Coworking (early bird, promociones).</DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="codigo" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Código
            </label>
            <Input
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              required
              placeholder="EARLYBIRD25"
            />
          </div>

          <div>
            <label htmlFor="descuentoPct" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Descuento (%)
            </label>
            <Input
              id="descuentoPct"
              type="number"
              min={1}
              max={100}
              value={descuentoPct}
              onChange={(e) => setDescuentoPct(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="validoDesde" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Válido desde
              </label>
              <Input id="validoDesde" type="date" value={validoDesde} onChange={(e) => setValidoDesde(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="validoHasta" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Válido hasta
              </label>
              <Input id="validoHasta" type="date" value={validoHasta} onChange={(e) => setValidoHasta(e.target.value)} required />
            </div>
          </div>

          <div>
            <label htmlFor="usosMaximos" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Usos máximos (opcional)
            </label>
            <Input
              id="usosMaximos"
              type="number"
              min={1}
              value={usosMaximos}
              onChange={(e) => setUsosMaximos(e.target.value)}
              placeholder="Sin límite"
            />
          </div>

          <label className="flex items-center gap-2 text-[13px] text-[--edu-text]">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="h-4 w-4 rounded-sm border-[--edu-border] accent-[--inc-violet]"
            />
            Activo
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Guardando…" : "Guardar cupón"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
