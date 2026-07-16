import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";

import { BookingForm } from "@/components/coworking/BookingForm";
import { createClient } from "@/lib/supabase/server";
import { SPACE_TYPE_LABEL, type SpaceType } from "@/modules/admin/coworking";

export default async function ReservarSpacePage({ params }: { params: { spaceId: string } }) {
  const supabase = await createClient();

  const { data: space } = await supabase
    .from("spaces")
    .select("id, nombre, tipo, capacidad, precio_hora, descripcion, activo, location_id")
    .eq("id", params.spaceId)
    .single();

  if (!space || !space.activo) {
    notFound();
  }

  const { data: location } = await supabase.from("locations").select("nombre, direccion").eq("id", space.location_id).single();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let discountPct = 0;
  let coworkingCreditos = 0;
  if (user) {
    const { data } = await supabase.rpc("get_user_discount");
    discountPct = typeof data === "number" ? data : 0;

    const { data: profile } = await supabase.from("users").select("coworking_creditos_canje").eq("id", user.id).single();
    coworkingCreditos = profile?.coworking_creditos_canje ?? 0;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="flex items-center gap-1 text-[13px] text-[--edu-text-muted]">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {location?.nombre} — {location?.direccion}
        </p>
        <h1 className="mt-1 text-[24px] font-semibold text-white">{space.nombre}</h1>
        <p className="text-sm text-[--edu-text-muted]">
          {SPACE_TYPE_LABEL[space.tipo as SpaceType]} · Capacidad {space.capacidad} · ${space.precio_hora}/hs
        </p>
        {space.descripcion ? <p className="mt-2 text-sm text-[--edu-text-muted]">{space.descripcion}</p> : null}
      </div>

      <BookingForm
        spaceId={space.id}
        precioHora={space.precio_hora}
        discountPct={discountPct}
        isLoggedIn={Boolean(user)}
        coworkingCreditos={coworkingCreditos}
      />
    </div>
  );
}
