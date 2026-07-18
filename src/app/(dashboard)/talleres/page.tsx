import { TallerCard } from "@/components/educativa/TallerCard";
import type { TallerRow } from "@/modules/talleres/talleres";
import { createClient } from "@/lib/supabase/server";

export default async function TalleresPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: talleres } = await supabase
    .from("talleres")
    .select("id, titulo, descripcion, fecha_inicio, duracion_minutos, link_virtual, grabacion_url, capacidad, estado")
    .eq("estado", "publicado")
    .order("fecha_inicio", { ascending: true });

  const { data: misInscripciones } = user
    ? await supabase.from("taller_inscripciones").select("taller_id").eq("user_id", user.id)
    : { data: [] as { taller_id: string }[] };

  const inscriptoIds = new Set((misInscripciones ?? []).map((i) => i.taller_id as string));

  const rows = (talleres ?? []) as TallerRow[];

  const counts = await Promise.all(
    rows.map(async (t) => {
      if (t.capacidad === null) return { id: t.id, count: 0 };
      const { data: count } = await supabase.rpc("get_taller_inscripcion_count", { p_taller_id: t.id });
      return { id: t.id, count: count ?? 0 };
    })
  );
  const countById = new Map(counts.map((c) => [c.id, c.count]));

  const disponibles = rows.filter((t) => !inscriptoIds.has(t.id));
  const misTalleres = rows.filter((t) => inscriptoIds.has(t.id));

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Talleres</h1>
        <p className="text-sm text-[--edu-text-muted]">Contenido en vivo, sin costo adicional.</p>
      </div>

      <div>
        <h2 className="mb-2 text-[13px] font-semibold text-[--edu-text]">Mis talleres</h2>
        {misTalleres.length === 0 ? (
          <p className="text-[13px] text-[--edu-text-muted]">Todavía no te inscribiste a ningún taller.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {misTalleres.map((t) => (
              <TallerCard key={t.id} taller={t} inscripto cantidadInscriptos={countById.get(t.id) ?? 0} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-[13px] font-semibold text-[--edu-text]">Disponibles</h2>
        {disponibles.length === 0 ? (
          <p className="text-[13px] text-[--edu-text-muted]">No hay talleres disponibles por ahora.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {disponibles.map((t) => (
              <TallerCard key={t.id} taller={t} inscripto={false} cantidadInscriptos={countById.get(t.id) ?? 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
