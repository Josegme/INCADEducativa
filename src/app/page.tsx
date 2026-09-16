import Link from "next/link";
import { ArrowRight, Award, BookOpen, DoorOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getFlags } from "@/lib/flags";

export default async function Home() {
  const flags = await getFlags();

  return (
    <main className="min-h-screen bg-edu-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[--inc-violet] text-caption font-semibold text-white">
            IN
          </div>
          <span className="text-body font-semibold text-white">INCADEducativa</span>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/login">Iniciar sesión</Link>
        </Button>
      </header>

      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16 md:py-24">
        <p className="text-caption font-semibold uppercase tracking-wide text-[--inc-violet-text]">
          Escuela de Negocios INCADE
        </p>
        <h1 className="max-w-3xl text-display font-bold text-white">
          Aprendé, certificá y trabajá en un solo lugar.
        </h1>
        <p className="max-w-2xl text-section text-[--edu-text-muted]">
          Cursos, capacitaciones, talleres y coworking de INCADE. Continuá donde dejaste,
          acumulá puntos y obtené certificados con QR verificable.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/login">
              Entrar a la plataforma
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/carreras">Ver carreras</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 md:grid-cols-3">
        <article className="rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface] p-5">
          <BookOpen className="mb-3 h-6 w-6 text-[--inc-violet-text]" aria-hidden />
          <h2 className="text-section font-semibold text-white">Cursos y capacitaciones</h2>
          <p className="mt-2 text-body text-[--edu-text-muted]">
            Contenido con progreso, evaluaciones y certificados automáticos.
          </p>
        </article>
        <article className="rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface] p-5">
          <Award className="mb-3 h-6 w-6 text-[--edu-gold]" aria-hidden />
          <h2 className="text-section font-semibold text-white">Puntos y certificados</h2>
          <p className="mt-2 text-body text-[--edu-text-muted]">
            Ledger de logros y verificación pública de cada certificado.
          </p>
        </article>
        {flags.coworking ? (
          <article className="rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface] p-5">
            <DoorOpen className="mb-3 h-6 w-6 text-[--inc-violet-text]" aria-hidden />
            <h2 className="text-section font-semibold text-white">Coworking</h2>
            <p className="mt-2 text-body text-[--edu-text-muted]">
              Reservá espacios en Posadas, con seña o pago completo.
            </p>
            <Button asChild variant="ghost" size="sm" className="mt-3 px-0">
              <Link href="/servicios/coworking">Ver espacios</Link>
            </Button>
          </article>
        ) : (
          <article className="rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface] p-5">
            <DoorOpen className="mb-3 h-6 w-6 text-[--inc-violet-text]" aria-hidden />
            <h2 className="text-section font-semibold text-white">Comunidad INCADE</h2>
            <p className="mt-2 text-body text-[--edu-text-muted]">
              Talleres, tutorías y una red de aprendizaje en Posadas.
            </p>
          </article>
        )}
      </section>
    </main>
  );
}
