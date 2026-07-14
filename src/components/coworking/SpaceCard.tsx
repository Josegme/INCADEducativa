import Link from "next/link";
import { GraduationCap, Laptop, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SPACE_TYPE_LABEL, type SpaceType } from "@/modules/admin/coworking";

const SPACE_TYPE_ICON: Record<SpaceType, typeof Laptop> = {
  hot_desk: Laptop,
  sala_reunion: Users,
  aula: GraduationCap,
};

export interface SpaceCardProps {
  id: string;
  nombre: string;
  tipo: SpaceType;
  capacidad: number;
  precioHora: number;
  descripcion: string | null;
  imagenUrl: string | null;
  precioConDescuento: number | null;
}

export function SpaceCard({ id, nombre, tipo, capacidad, precioHora, descripcion, imagenUrl, precioConDescuento }: SpaceCardProps) {
  const Icon = SPACE_TYPE_ICON[tipo];

  return (
    <div className="flex flex-col gap-3 rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
      <div className="flex h-32 items-center justify-center rounded-md bg-white/[0.04]">
        {imagenUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagenUrl} alt={nombre} className="h-full w-full rounded-md object-cover" />
        ) : (
          <Icon className="h-10 w-10 text-[--edu-text-faint]" aria-hidden />
        )}
      </div>

      <div className="flex items-center gap-2">
        <Badge state="active">{SPACE_TYPE_LABEL[tipo]}</Badge>
        <span className="flex items-center gap-1 text-[12px] text-[--edu-text-muted]">
          <Users className="h-3.5 w-3.5" aria-hidden />
          {capacidad}
        </span>
      </div>

      <h3 className="text-[15px] font-semibold text-white">{nombre}</h3>
      {descripcion ? <p className="text-[13px] text-[--edu-text-muted]">{descripcion}</p> : null}

      <div className="mt-auto flex items-baseline gap-2">
        {precioConDescuento !== null ? (
          <>
            <span className="text-[13px] text-[--edu-text-faint] line-through">${precioHora}</span>
            <span className="text-[18px] font-semibold text-[--edu-success-text]">${precioConDescuento}/hs</span>
          </>
        ) : (
          <span className="text-[18px] font-semibold text-white">${precioHora}/hs</span>
        )}
      </div>

      <Button asChild size="sm">
        <Link href={`/servicios/coworking/reservar/${id}`}>Reservar</Link>
      </Button>
    </div>
  );
}
