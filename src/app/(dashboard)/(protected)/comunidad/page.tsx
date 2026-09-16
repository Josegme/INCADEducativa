import { notFound } from "next/navigation";

import { ForoFilterBar } from "@/components/comunidad/ForoFilterBar";
import { PublicacionForm } from "@/components/comunidad/PublicacionForm";
import { PublicacionList, type PublicacionListItem } from "@/components/comunidad/PublicacionList";
import { getFlags } from "@/lib/flags";
import { createClient } from "@/lib/supabase/server";

interface ComunidadPageProps {
  searchParams: { carrera?: string };
}

export default async function ComunidadPage({ searchParams }: ComunidadPageProps) {
  const flags = await getFlags();
  if (!flags.comunidad) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // (protected)/layout.tsx ya exige sesión — esto es defensa en profundidad,
  // no la única barrera.
  if (!user) {
    notFound();
  }

  const [{ data: profile }, { data: carreras }] = await Promise.all([
    supabase.from("users").select("role, carrera_id").eq("id", user.id).single(),
    supabase.from("careers").select("id, nombre").order("nombre", { ascending: true }),
  ]);

  const isAdmin = profile?.role === "admin";
  const miCarrera = (carreras ?? []).find((c) => c.id === profile?.carrera_id) ?? null;

  let query = supabase
    .from("foro_publicaciones")
    .select(
      "id, autor_id, carrera_id, contenido, oculto, created_at, autor:users!foro_publicaciones_autor_id_fkey(nombre, apellido), carrera:careers(nombre)"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (searchParams.carrera === "institucional") {
    query = query.is("carrera_id", null);
  } else if (searchParams.carrera && searchParams.carrera !== "todas") {
    query = query.eq("carrera_id", searchParams.carrera);
  }

  const { data: rows } = await query;

  const publicaciones: PublicacionListItem[] = (rows ?? []).map((row) => {
    const autor = row.autor as unknown as { nombre: string; apellido: string } | null;
    const carrera = row.carrera as unknown as { nombre: string } | null;
    return {
      id: row.id as string,
      autorId: row.autor_id as string,
      autorNombre: autor?.nombre ?? "Usuario",
      autorApellido: autor?.apellido ?? "",
      carreraNombre: carrera?.nombre ?? null,
      contenido: row.contenido as string,
      oculto: row.oculto as boolean,
      createdAt: row.created_at as string,
    };
  });

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Comunidad</h1>
        <p className="text-sm text-[--edu-text-muted]">Foro de tu carrera y feed institucional de INCADE.</p>
      </div>

      <PublicacionForm miCarrera={miCarrera} isAdmin={isAdmin} />

      <ForoFilterBar carreras={carreras ?? []} />

      <PublicacionList publicaciones={publicaciones} isAdmin={isAdmin} />
    </div>
  );
}
