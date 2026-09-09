import { notFound } from "next/navigation";

import { BatchBookingForm } from "@/components/coordinador/BatchBookingForm";
import { SPACE_TYPE_LABEL, type SpaceType } from "@/modules/admin/coworking";
import { createClient } from "@/lib/supabase/server";

export default async function CoordinadorReservaEnLotePage({ params }: { params: { spaceId: string } }) {
  const supabase = await createClient();

  const { data: space } = await supabase
    .from("spaces")
    .select("id, nombre, tipo, capacidad, precio_hora, location_id")
    .eq("id", params.spaceId)
    .single();

  if (!space) {
    notFound();
  }

  const { data: location } = await supabase.from("locations").select("nombre").eq("id", space.location_id).single();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Reserva en lote — {space.nombre}</h1>
        <p className="text-sm text-[--edu-text-muted]">
          {location?.nombre} · {SPACE_TYPE_LABEL[space.tipo as SpaceType]} · ${space.precio_hora}/hs
        </p>
      </div>

      <BatchBookingForm spaceId={space.id} />
    </div>
  );
}
