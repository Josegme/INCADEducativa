import { Award, Inbox, Play } from "lucide-react";

import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-title font-semibold text-white">{title}</h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

export default function DesignPreviewPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12">
      <PageHeader
        title="Design System v3.0 — Catálogo"
        description="Escala tipográfica display/title/section/body/caption, primitivas y sistema de páginas."
        breadcrumbs={[{ label: "Inicio", href: "/" }, { label: "Design preview" }]}
      />

      <Section title="Tipografía">
        <div className="flex w-full flex-col gap-2">
          <p className="text-display font-bold text-white">Display 30 — héroe</p>
          <p className="text-title font-semibold text-white">Title 22 — página</p>
          <p className="text-section font-semibold text-white">Section 17 — bloque</p>
          <p className="text-body text-[--edu-text-muted]">Body 15 — lectura continua</p>
          <p className="text-caption text-[--edu-text-faint]">Caption 12 — meta</p>
        </div>
      </Section>

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
        <Card variant="default" className="w-56 p-4 text-body text-white">
          default
        </Card>
        <Card variant="elevated" className="w-56 p-4 text-body text-white">
          elevated
        </Card>
        <Card variant="raised" className="w-56 p-4 text-body text-white">
          raised
        </Card>
        <Card variant="certificate" className="flex w-56 items-center gap-2 p-4 text-body text-white">
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

      <Section title="Input + Label">
        <div className="flex w-72 flex-col gap-1">
          <Label htmlFor="preview-input">Email</Label>
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

      <Section title="Tabs + Skeleton">
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">Contenido</TabsTrigger>
            <TabsTrigger value="b">Recursos</TabsTrigger>
          </TabsList>
          <TabsContent value="a">
            <p className="text-body text-[--edu-text-muted]">Pestaña de contenido</p>
          </TabsContent>
          <TabsContent value="b">
            <Skeleton className="h-16 w-64" />
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="EmptyState">
        <div className="w-full">
          <EmptyState
            icon={Inbox}
            title="Nada por acá"
            description="Estado vacío de referencia para pantallas de producto."
            actionHref="/cursos"
            actionLabel="Ver cursos"
          />
        </div>
      </Section>

      <Section title="NotificationBanner">
        <NotificationBanner type="success">Guardado</NotificationBanner>
        <NotificationBanner type="warning">Pago pendiente</NotificationBanner>
      </Section>
    </main>
  );
}
