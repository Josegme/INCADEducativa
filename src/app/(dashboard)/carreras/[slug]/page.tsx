import { notFound } from "next/navigation";

import { CareerBlockedCTA } from "@/components/educativa/CareerBlockedCTA";
import { CareerMap } from "@/components/educativa/CareerMap";
import { getCareerBySlug } from "@/modules/educativa/mockCatalog";
import { createClient } from "@/lib/supabase/server";

export default async function CareerDetailPage({ params }: { params: { slug: string } }) {
  const career = getCareerBySlug(params.slug);
  if (!career) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("users").select("role").eq("id", user.id).single()
    : { data: null };

  const isAlumno = profile?.role === "alumno";

  return isAlumno ? <CareerMap career={career} /> : <CareerBlockedCTA career={career} />;
}
