import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { PageHeader } from "@/components/layout/PageHeader";
import type { CatalogCareer } from "@/modules/educativa/catalog";

interface CareerBlockedCTAProps {
  career: CatalogCareer;
}

function admisionesHref() {
  const wa = process.env.NEXT_PUBLIC_ADMISIONES_WHATSAPP?.replace(/\D/g, "");
  if (wa) {
    const text = encodeURIComponent("Hola, quiero información sobre matrícula presencial en INCADE.");
    return `https://wa.me/${wa}?text=${text}`;
  }
  return "https://incade.edu.ar";
}

export function CareerBlockedCTA({ career }: CareerBlockedCTAProps) {
  const href = admisionesHref();
  const isWhatsapp = href.includes("wa.me");

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={career.nombre} description={career.descripcion ?? undefined} />

      <NotificationBanner type="info">
        Esta carrera requiere matrícula presencial en INCADE. El mapa completo y la
        inscripción a módulos están disponibles solo para alumnos INCADE.
      </NotificationBanner>

      <Button variant="primary" className="w-fit" asChild>
        <a href={href} target="_blank" rel="noreferrer">
          {isWhatsapp ? "Escribir a admisiones por WhatsApp" : "Inscribite en el Instituto"}
        </a>
      </Button>
    </div>
  );
}
