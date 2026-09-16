"use server";

import { redirect } from "next/navigation";

import { createTutoriaAddonPreference } from "@/lib/mercadopago/preference";
import { notifyUsers } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface PurchaseTutoriaAddonState {
  error?: string;
}

/**
 * Compra del add-on de tutorías (T13, Etapa 3) — a diferencia de
 * purchaseCourseAction/createCatalogSubscriptionAction, acá SIEMPRE exige
 * sesión: solo tiene sentido pagar el add-on de un curso al que ya se
 * accedió (comprado o suscripto), así que el usuario ya tiene cuenta.
 */
export async function purchaseTutoriaAddonAction(formData: FormData): Promise<PurchaseTutoriaAddonState> {
  const courseId = formData.get("courseId");
  if (typeof courseId !== "string" || !courseId) {
    return { error: "Falta el curso" };
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "Necesitás iniciar sesión" };
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "comunidad") {
    return { error: "Este add-on es solo para usuarios de la comunidad" };
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment) {
    return { error: "Necesitás tener acceso a este curso antes de comprar el add-on" };
  }

  const { data: existingAccess } = await supabase.rpc("has_tutoria_addon_access", { p_course_id: courseId });
  if (existingAccess) {
    return { error: "Ya tenés acceso a las tutorías de este curso" };
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, titulo, precio_tutorias_addon")
    .eq("id", courseId)
    .single();

  if (!course || course.precio_tutorias_addon <= 0) {
    return { error: "El add-on de tutorías no está disponible para este curso" };
  }

  const { data: compra, error: compraError } = await admin
    .from("tutoria_addon_compras")
    .insert({ user_id: user.id, course_id: course.id, monto: course.precio_tutorias_addon })
    .select("id")
    .single();

  if (compraError || !compra) {
    return { error: "No se pudo iniciar la compra — intentá de nuevo" };
  }

  const preference = await createTutoriaAddonPreference({
    compraId: compra.id,
    courseSlug: course.slug,
    courseTitle: course.titulo,
    unitPrice: course.precio_tutorias_addon,
    payerEmail: user.email,
  });

  if (preference) {
    await admin.from("tutoria_addon_compras").update({ mp_preference_id: preference.preferenceId }).eq("id", compra.id);
  }

  const { data: admins } = await admin.from("users").select("id, email").eq("role", "admin");
  if (admins && admins.length > 0) {
    await notifyUsers(admin, {
      tipo: "sistema",
      referenciaId: compra.id,
      titulo: `Nueva compra de add-on de tutorías — ${course.titulo}`,
      cuerpo: `Un usuario inició la compra del add-on de tutorías de "${course.titulo}".`,
      recipients: admins.map((a) => ({ userId: a.id as string, email: a.email as string })),
      emailSubject: "Nueva compra de add-on de tutorías",
    });
  }

  if (preference) {
    redirect(preference.initPoint);
  }

  redirect(`/cursos/${course.slug}`);
}
