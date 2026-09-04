import { BroadcastComposer } from "@/components/admin/BroadcastComposer";
import { createClient } from "@/lib/supabase/server";

export default async function AdminComunicadosPage() {
  const supabase = await createClient();

  const [{ data: courses }, { data: careers }] = await Promise.all([
    supabase.from("courses").select("id, titulo").eq("estado", "publicado").order("titulo", { ascending: true }),
    supabase.from("careers").select("id, nombre").order("orden", { ascending: true }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Comunicados</h1>
        <p className="text-sm text-[--edu-text-muted]">
          Enviá un comunicado institucional a los alumnos inscriptos en los cursos o carreras que elijas — in-app y por
          email.
        </p>
      </div>

      <BroadcastComposer
        courses={(courses ?? []).map((c) => ({ id: c.id as string, label: c.titulo as string }))}
        careers={(careers ?? []).map((c) => ({ id: c.id as string, label: c.nombre as string }))}
      />
    </div>
  );
}
