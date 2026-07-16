import Link from "next/link";
import { CreditCard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MEMBERSHIP_PLAN_TYPE_LABEL } from "@/modules/admin/membershipPlans";
import type { MembershipPlanPublic } from "@/modules/coworking/membership";

export function MembershipPlanCard({ plan }: { plan: MembershipPlanPublic }) {
  return (
    <div className="flex flex-col gap-3 rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
      <div className="flex h-20 items-center justify-center rounded-md bg-white/[0.04]">
        <CreditCard className="h-8 w-8 text-[--edu-text-faint]" aria-hidden />
      </div>

      <Badge state="active">{MEMBERSHIP_PLAN_TYPE_LABEL[plan.tipo]}</Badge>
      <h3 className="text-[15px] font-semibold text-white">{plan.nombre}</h3>
      <p className="text-[13px] text-[--edu-text-muted]">{plan.creditos_incluidos} créditos incluidos</p>

      <div className="mt-auto text-[18px] font-semibold text-white">${plan.precio}</div>

      <Button asChild size="sm">
        <Link href={`/servicios/coworking/membresia/${plan.id}`}>Suscribirme</Link>
      </Button>
    </div>
  );
}
