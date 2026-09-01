import { CatalogPlanCard } from "@/components/educativa/CatalogPlanCard";
import { getFlags } from "@/lib/flags";
import { createClient } from "@/lib/supabase/server";
import type { CatalogPlanPublic } from "@/modules/educativa/subscription";

export default async function CatalogSuscripcionPage() {
  const supabase = await createClient();
  const flags = await getFlags();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans } = await supabase
    .from("catalogo_planes")
    .select("id, nombre, precio")
    .eq("activo", true)
    .order("precio", { ascending: true });

  const planRows = (plans ?? []) as CatalogPlanPublic[];

  const { data: suscripcion } = user
    ? await supabase
        .from("catalogo_suscripciones")
        .select("id, activa, fin")
        .eq("user_id", user.id)
        .eq("activa", true)
        .maybeSingle()
    : { data: null };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-[24px] font-semibold text-white">Suscripción al catálogo</h1>
        <p className="text-sm text-[--edu-text-muted]">
          Suscribite mensualmente y accedé a todos los cursos pagos del catálogo educativo.
        </p>
      </div>

      {suscripcion ? (
        <div className="rounded-[14px] border-[0.5px] border-[--edu-success-border] bg-[--edu-success-subtle] p-4 text-sm text-[--edu-success-text]">
          Ya tenés una suscripción activa — vence el{" "}
          {suscripcion.fin ? new Date(suscripcion.fin).toLocaleDateString("es-AR") : "—"}.
        </div>
      ) : null}

      {!flags.comunidad ? (
        <p className="text-sm text-[--edu-text-muted]">La suscripción al catálogo está disponible próximamente.</p>
      ) : planRows.length === 0 ? (
        <p className="text-sm text-[--edu-text-muted]">Todavía no hay planes de suscripción publicados.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {planRows.map((plan) => (
            <CatalogPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
