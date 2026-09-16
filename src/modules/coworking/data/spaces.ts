import { createClient } from "@/lib/supabase/server";

export async function listActiveSpaces() {
  const supabase = await createClient();
  return supabase
    .from("spaces")
    .select("id, nombre, tipo, capacidad, precio_hora, descripcion, imagen_url, activo, location_id")
    .eq("activo", true)
    .order("nombre");
}
