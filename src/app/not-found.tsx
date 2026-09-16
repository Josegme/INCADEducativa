import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-edu-bg px-6 text-center">
      <h1 className="text-display font-bold text-white">Página no encontrada</h1>
      <p className="text-body text-[--edu-text-muted]">Esa ruta no existe o ya no está disponible.</p>
      <Button asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </main>
  );
}
