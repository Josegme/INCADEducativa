import Link from "next/link";
import { MapPin } from "lucide-react";

import { SpaceCard } from "@/components/coworking/SpaceCard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { LocationRow, SpaceRow } from "@/modules/admin/coworking";

export default async function CoworkingLandingPage({
  searchParams,
}: {
  searchParams: { sede?: string };
}) {
  const supabase = await createClient();

  const { data: locationRows } = await supabase
    .from("locations")
    .select("id, nombre, direccion, activa")
    .eq("activa", true)
    .order("nombre", { ascending: true });

  const locations = (locationRows ?? []) as LocationRow[];
  const selectedLocationId = searchParams.sede ?? locations[0]?.id;

  const { data: spaceRows } = selectedLocationId
    ? await supabase
        .from("spaces")
        .select("id, location_id, nombre, tipo, capacidad, precio_hora, descripcion, imagen_url, activo")
        .eq("location_id", selectedLocationId)
        .eq("activo", true)
        .order("nombre", { ascending: true })
    : { data: [] as SpaceRow[] };

  const spaces = (spaceRows ?? []) as SpaceRow[];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let descuentoPct = 0;
  if (user) {
    const { data } = await supabase.rpc("get_user_discount");
    descuentoPct = typeof data === "number" ? data : 0;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[24px] font-semibold text-white">Coworking INCADE</h1>
          <div className="flex gap-2">
            {user ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/servicios/coworking/mis-reservas">Mis reservas</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href="/servicios/coworking/membresia">Ver membresías</Link>
            </Button>
          </div>
        </div>
        <p className="text-sm text-[--edu-text-muted]">
          Espacios de trabajo y salas por hora en nuestras sedes de Posadas, Misiones. Reservá el que necesites.
        </p>
        {descuentoPct > 0 ? (
          <span className="w-fit rounded-pill border-[0.5px] border-[--edu-success-border] bg-[--edu-success-subtle] px-3 py-1 text-[12px] font-semibold text-[--edu-success-text]">
            Tenés {descuentoPct}% de descuento institucional aplicado
          </span>
        ) : null}
      </div>

      {locations.length === 0 ? (
        <p className="text-sm text-[--edu-text-muted]">Todavía no hay sedes de Coworking publicadas.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {locations.map((location) => (
              <Link
                key={location.id}
                href={`/servicios/coworking?sede=${location.id}`}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border-[0.5px] px-3 py-1.5 text-[13px] font-medium transition-colors",
                  location.id === selectedLocationId
                    ? "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]"
                    : "border-[--edu-border] text-[--edu-text-muted] hover:bg-white/5"
                )}
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {location.nombre}
              </Link>
            ))}
          </div>

          {spaces.length === 0 ? (
            <p className="text-sm text-[--edu-text-muted]">Esta sede todavía no tiene espacios publicados.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {spaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  id={space.id}
                  nombre={space.nombre}
                  tipo={space.tipo}
                  capacidad={space.capacidad}
                  precioHora={space.precio_hora}
                  descripcion={space.descripcion}
                  imagenUrl={space.imagen_url}
                  precioConDescuento={descuentoPct > 0 ? Math.round(space.precio_hora * (1 - descuentoPct / 100)) : null}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
