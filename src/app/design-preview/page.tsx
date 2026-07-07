import { Award, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Progress } from "@/components/ui/progress";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[20px] font-semibold text-white">{title}</h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

export default function DesignPreviewPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold text-white">Design System v2.0 — Preview</h1>
        <p className="text-sm text-[--edu-text-muted]">
          Catálogo de componentes base de INCADEducativa. Referencia:
          docs/design/COMPONENTS.md.
        </p>
      </header>

      <Section title="Button">
        <Button variant="primary">
          <Play className="h-4 w-4" />
          Continuar aprendiendo
        </Button>
        <Button variant="outline">Ver verificación</Button>
        <Button variant="destructive">Rechazar</Button>
        <Button variant="ghost">Cancelar</Button>
      </Section>

      <Section title="Card">
        <Card variant="default" className="w-56 p-4 text-sm text-white">
          default
        </Card>
        <Card variant="elevated" className="w-56 p-4 text-sm text-white">
          elevated
        </Card>
        <Card variant="raised" className="w-56 p-4 text-sm text-white">
          raised
        </Card>
        <Card variant="certificate" className="flex w-56 items-center gap-2 p-4 text-sm text-white">
          <Award className="h-5 w-5 text-[--edu-gold]" aria-hidden />
          certificate
        </Card>
      </Section>

      <Section title="Badge">
        <Badge state="active">Activo</Badge>
        <Badge state="completed">Completado</Badge>
        <Badge state="pending">Pendiente</Badge>
        <Badge state="error">Reprobado</Badge>
        <Badge state="locked">Bloqueado</Badge>
        <Badge state="gold">Certificado</Badge>
      </Section>

      <Section title="Input">
        <div className="flex w-72 flex-col gap-1">
          <label className="text-[12px] font-medium text-[--edu-text-muted]" htmlFor="preview-input">
            Email
          </label>
          <Input id="preview-input" placeholder="nombre@incade.edu.ar" />
        </div>
      </Section>

      <Section title="Progress">
        <div className="flex w-full flex-col gap-3">
          <Progress value={65} />
          <Progress value={100} variant="success" />
          <Progress value={30} variant="warning" />
        </div>
      </Section>

      <Section title="Banners de notificación">
        <div className="flex w-full flex-col gap-3">
          <NotificationBanner type="info">Nuevo anuncio de tu docente.</NotificationBanner>
          <NotificationBanner type="success">Módulo completado correctamente.</NotificationBanner>
          <NotificationBanner type="warning">Te quedan 5 minutos para el examen.</NotificationBanner>
          <NotificationBanner type="danger">No alcanzaste la nota mínima.</NotificationBanner>
        </div>
      </Section>
    </main>
  );
}
