import Link from "next/link";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function CarrerasPage() {
  const supabase = await createClient();
  const { data: careers } = await supabase
    .from("careers")
    .select("slug, nombre, descripcion")
    .eq("activa", true)
    .order("orden", { ascending: true });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Carreras</h1>
        <p className="text-sm text-[--edu-text-muted]">
          Programas completos de INCADE, con certificación al finalizar todos sus cursos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(careers ?? []).map((career) => (
          <Link key={career.slug} href={`/carreras/${career.slug}`}>
            <Card className="flex h-full flex-col gap-2 p-4">
              <span className="text-[14px] font-medium text-[--edu-text]">{career.nombre}</span>
              <span className="text-[12px] text-[--edu-text-muted]">{career.descripcion}</span>
            </Card>
          </Link>
        ))}
        {(careers ?? []).length === 0 ? (
          <p className="text-sm text-[--edu-text-muted]">Todavía no hay carreras cargadas.</p>
        ) : null}
      </div>
    </div>
  );
}
