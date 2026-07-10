import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import type { CatalogCareer } from "@/modules/educativa/catalog";

interface CareerBlockedCTAProps {
  career: CatalogCareer;
}

export function CareerBlockedCTA({ career }: CareerBlockedCTAProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">{career.nombre}</h1>
        <p className="mt-1 text-sm text-[--edu-text-muted]">{career.descripcion}</p>
      </div>

      <NotificationBanner type="info">
        Esta carrera requiere matrícula presencial en INCADE. El mapa completo y la
        inscripción a módulos están disponibles solo para alumnos INCADE.
      </NotificationBanner>

      <Button variant="primary" className="w-fit">
        Inscribite en el Instituto
      </Button>
    </div>
  );
}
