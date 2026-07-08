import Link from "next/link";

import { Card } from "@/components/ui/card";
import { CATEGORY_LABEL, MOCK_CAREERS } from "@/modules/educativa/mockCatalog";

export default function CarrerasPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Carreras</h1>
        <p className="text-sm text-[--edu-text-muted]">
          Programas completos de INCADE, con certificación al finalizar todos sus cursos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_CAREERS.map((career) => (
          <Link key={career.slug} href={`/carreras/${career.slug}`}>
            <Card className="flex h-full flex-col gap-2 p-4">
              <span className="text-[12px] font-semibold uppercase tracking-[0.7px] text-[--inc-violet]">
                {CATEGORY_LABEL[career.categoria]}
              </span>
              <span className="text-[14px] font-medium text-[--edu-text]">{career.nombre}</span>
              <span className="text-[12px] text-[--edu-text-muted]">{career.descripcion}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
