import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CatalogPlanPublic } from "@/modules/educativa/subscription";

export function CatalogPlanCard({ plan }: { plan: CatalogPlanPublic }) {
  return (
    <div className="flex flex-col gap-3 rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
      <div className="flex h-20 items-center justify-center rounded-md bg-white/[0.04]">
        <GraduationCap className="h-8 w-8 text-[--edu-text-faint]" aria-hidden />
      </div>

      <Badge state="active">Mensual</Badge>
      <h3 className="text-[15px] font-semibold text-white">{plan.nombre}</h3>
      <p className="text-[13px] text-[--edu-text-muted]">Acceso a todo el catálogo de cursos pagos</p>

      <div className="mt-auto text-[18px] font-semibold text-white">${plan.precio} /mes</div>

      <Button asChild size="sm">
        <Link href={`/cursos/suscripcion/${plan.id}`}>Suscribirme</Link>
      </Button>
    </div>
  );
}
