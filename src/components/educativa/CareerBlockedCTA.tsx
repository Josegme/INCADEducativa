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

      {/* Addendum 04 / ADR-15: CTA a admisiones presenciales, no a compra —
          no hay número de WhatsApp de admisiones cargado en el repo, se linkea
          al sitio institucional (incade.edu.ar) hasta que se sume ese dato. */}
      <Button variant="primary" className="w-fit" asChild>
        <a href="https://incade.edu.ar" target="_blank" rel="noreferrer">
          Inscribite en el Instituto
        </a>
      </Button>
    </div>
  );
}
