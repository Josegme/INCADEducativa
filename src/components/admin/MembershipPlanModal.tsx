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
import {
  MEMBERSHIP_PLAN_TYPES,
  MEMBERSHIP_PLAN_TYPE_LABEL,
  type MembershipPlanRow,
  type MembershipPlanType,
} from "@/modules/admin/membershipPlans";
import {
  createMembershipPlanAction,
  updateMembershipPlanAction,
} from "@/app/(dashboard)/admin/actions/membershipPlanActions";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

interface MembershipPlanModalProps {
  plan?: MembershipPlanRow;
  trigger?: React.ReactNode;
}

export function MembershipPlanModal({ plan, trigger }: MembershipPlanModalProps) {
  const router = useRouter();
  const isEdit = Boolean(plan);
  const [open, setOpen] = React.useState(false);
  const [tipo, setTipo] = React.useState<MembershipPlanType>(plan?.tipo ?? "mensual");
  const [nombre, setNombre] = React.useState(plan?.nombre ?? "");
  const [precio, setPrecio] = React.useState(plan?.precio?.toString() ?? "");
  const [creditosIncluidos, setCreditosIncluidos] = React.useState(plan?.creditos_incluidos?.toString() ?? "");
  const [activo, setActivo] = React.useState(plan?.activo ?? true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setTipo(plan?.tipo ?? "mensual");
    setNombre(plan?.nombre ?? "");
    setPrecio(plan?.precio?.toString() ?? "");
    setCreditosIncluidos(plan?.creditos_incluidos?.toString() ?? "");
    setActivo(plan?.activo ?? true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    if (plan) formData.set("id", plan.id);
    formData.set("tipo", tipo);
    formData.set("nombre", nombre);
    formData.set("precio", precio);
    formData.set("creditosIncluidos", creditosIncluidos);
    formData.set("activo", String(activo));

    const result = plan ? await updateMembershipPlanAction(formData) : await createMembershipPlanAction(formData);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant={isEdit ? "outline" : "primary"} size="sm">
            {isEdit ? "Editar" : "Nuevo plan"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar plan — ${plan?.nombre}` : "Nuevo plan de membresía"}</DialogTitle>
          <DialogDescription>Planes de membresía de Coworking (mensual/anual con créditos).</DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="nombre" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Nombre
            </label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Membresía Mensual"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tipo" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Tipo
              </label>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as MembershipPlanType)}
                className={SELECT_CLASS}
              >
                {MEMBERSHIP_PLAN_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-[--edu-surface-raised]">
                    {MEMBERSHIP_PLAN_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="precio" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Precio ($)
              </label>
              <Input
                id="precio"
                type="number"
                min={0}
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="creditosIncluidos" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Créditos incluidos
            </label>
            <Input
              id="creditosIncluidos"
              type="number"
              min={1}
              value={creditosIncluidos}
              onChange={(e) => setCreditosIncluidos(e.target.value)}
              required
              placeholder="10"
            />
          </div>

          <label className="flex items-center gap-2 text-[13px] text-[--edu-text]">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="h-4 w-4 rounded-sm border-[--edu-border] accent-[--inc-violet]"
            />
            Activo (visible para suscribirse)
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Guardando…" : "Guardar plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
