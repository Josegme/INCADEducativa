import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SPACE_TYPE_LABEL, type LocationRow, type SpaceRow } from "@/modules/admin/coworking";
import { createClient } from "@/lib/supabase/server";

export default async function CoordinadorReservasPage() {
  const supabase = await createClient();

  const [{ data: locations }, { data: spaces }] = await Promise.all([
    supabase.from("locations").select("id, nombre, direccion, activa").eq("activa", true).order("nombre", { ascending: true }),
    supabase
      .from("spaces")
      .select("id, location_id, nombre, tipo, capacidad, precio_hora, descripcion, imagen_url, activo")
      .eq("activo", true)
      .order("nombre", { ascending: true }),
  ]);

  const locationRows = (locations ?? []) as LocationRow[];
  const spaceRows = (spaces ?? []) as SpaceRow[];
  const nameByLocation = new Map(locationRows.map((l) => [l.id, l.nombre]));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Reservas en lote</h1>
        <p className="text-sm text-[--edu-text-muted]">
          Reservá el mismo espacio y horario durante varias semanas seguidas — uso institucional, sin pago online.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {spaceRows.map((space) => (
          <div key={space.id} className="flex flex-col gap-2 rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
            <span className="text-[13px] text-[--edu-text-muted]">{nameByLocation.get(space.location_id) ?? "—"}</span>
            <h3 className="text-[15px] font-semibold text-white">{space.nombre}</h3>
            <span className="text-[12px] text-[--edu-text-muted]">{SPACE_TYPE_LABEL[space.tipo]}</span>
            <Button asChild size="sm" className="mt-auto">
              <Link href={`/coordinador/reservas/${space.id}`}>Reservar en lote</Link>
            </Button>
          </div>
        ))}
        {spaceRows.length === 0 ? (
          <p className="text-sm text-[--edu-text-muted]">Todavía no hay espacios de Coworking publicados.</p>
        ) : null}
      </div>
    </div>
  );
}
