"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getFlags } from "@/lib/flags";
import { createCourseSubscription } from "@/lib/mercadopago/subscription";
import { notifyUsers } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { registerFieldsSchema } from "@/modules/coworking/booking";

export interface SubscriptionActionState {
  error?: string;
}

/**
 * Alta de suscripción mensual al catálogo educativo (Etapa 3). A diferencia
 * de createMembershipAction (Coworking, exige sesión), acá sí hay rama de
 * autorregistro de invitado — mismo criterio que purchaseCourseAction:
 * regla general de E3 (CLAUDE.md #2), el usuario nuevo queda `comunidad`
 * directo, nunca `lead`.
 */
export async function createCatalogSubscriptionAction(formData: FormData): Promise<SubscriptionActionState> {
  const planId = formData.get("planId");
  if (typeof planId !== "string" || !planId) {
    return { error: "Falta el plan elegido" };
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  let {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const flags = await getFlags();
    if (!flags.comunidad) {
      return { error: "Iniciá sesión para suscribirte" };
    }

    const registerParsed = registerFieldsSchema.safeParse({
      nombre: formData.get("nombre"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!registerParsed.success) {
      return { error: registerParsed.error.issues[0]?.message ?? "Completá tus datos para suscribirte" };
    }

    const { nombre, email, password } = registerParsed.data;

    const { data: existing } = await admin.from("users").select("id").eq("email", email.toLowerCase()).maybeSingle();
    if (existing) {
      return { error: "Ya existe una cuenta con ese email — iniciá sesión para suscribirte" };
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError || !created.user) {
      return { error: "No se pudo crear la cuenta — probá con otro email" };
    }

    const [first, ...rest] = nombre.trim().split(/\s+/);
    const { error: insertError } = await admin.from("users").insert({
      id: created.user.id,
      email,
      nombre: first,
      apellido: rest.join(" "),
      role: "comunidad",
    });

    if (insertError) {
      await admin.auth.admin.deleteUser(created.user.id);
      return { error: "No se pudo crear tu perfil — intentá de nuevo" };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      return { error: "Cuenta creada, pero no se pudo iniciar sesión — probá ingresar manualmente" };
    }

    user = (await supabase.auth.getUser()).data.user;
  }

  if (!user || !user.email) {
    return { error: "No se pudo identificar tu sesión" };
  }

  const { data: plan } = await supabase
    .from("catalogo_planes")
    .select("id, nombre, precio, activo")
    .eq("id", planId)
    .single();

  if (!plan || !plan.activo) {
    return { error: "Ese plan ya no está disponible" };
  }

  const { data: existingSub } = await supabase
    .from("catalogo_suscripciones")
    .select("id")
    .eq("user_id", user.id)
    .eq("activa", true)
    .maybeSingle();

  if (existingSub) {
    return { error: "Ya tenés una suscripción activa" };
  }

  const { data: discountData } = await supabase.rpc("get_user_discount");
  const descuentoPct = typeof discountData === "number" ? discountData : 0;
  const monto =
    descuentoPct > 0 ? Math.round(plan.precio * (1 - descuentoPct / 100) * 100) / 100 : plan.precio;

  const { data: suscripcion, error: insertError } = await supabase
    .from("catalogo_suscripciones")
    .insert({
      user_id: user.id,
      plan_id: plan.id,
      monto,
      descuento_pct: descuentoPct,
      tipo_descuento: descuentoPct > 0 ? "institucional" : "publico",
      activa: false,
    })
    .select("id")
    .single();

  if (insertError || !suscripcion) {
    return { error: "No se pudo iniciar la suscripción — intentá de nuevo" };
  }

  const subscription = await createCourseSubscription({
    suscripcionId: suscripcion.id,
    payerEmail: user.email,
    monto,
    reason: `Suscripción catálogo INCADEducativa — ${plan.nombre}`,
  });

  if (!subscription) {
    redirect(`/cursos/suscripcion/estado/${suscripcion.id}`);
  }

  await supabase
    .from("catalogo_suscripciones")
    .update({ mp_preapproval_id: subscription.preapprovalId })
    .eq("id", suscripcion.id);

  redirect(subscription.initPoint);
}

/**
 * Inscripción perezosa: un usuario con suscripción activa abre un curso
 * pago por primera vez y esta acción crea la fila de `enrollments` — a
 * partir de ahí, todo el gating existente (lecciones, evaluaciones,
 * anuncios, tutorías) funciona igual que para cualquier inscripto, sin
 * ningún cambio en esas páginas. Sin prerequisito de orden de carrera —
 * mismo criterio ya aplicado a compras_curso: un curso pago accedido por
 * suscripción es un producto standalone, no un paso de currícula.
 */
export async function enrollViaSubscriptionAction(courseId: string, courseSlug: string): Promise<SubscriptionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Necesitás iniciar sesión" };
  }

  const { data: hasSubscription } = await supabase.rpc("has_active_course_subscription");
  if (!hasSubscription) {
    return { error: "Necesitás una suscripción activa para acceder a este curso" };
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, estado, es_gratuito")
    .eq("id", courseId)
    .single();

  if (!course || course.estado !== "publicado") {
    return { error: "Este curso ya no está disponible" };
  }

  if (course.es_gratuito) {
    return { error: "Este curso es gratuito — usá el botón de inscripción" };
  }

  const { data: existingEnrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  if (existingEnrollment) {
    return {};
  }

  const { error: insertError } = await supabase.from("enrollments").insert({ user_id: user.id, course_id: course.id });

  if (insertError && insertError.code !== "23505") {
    return { error: "No se pudo activar el acceso — intentá de nuevo" };
  }

  const admin = createAdminClient();
  await notifyUsers(admin, {
    tipo: "sistema",
    referenciaId: course.id,
    courseId: course.id,
    titulo: "Acceso activado por suscripción",
    cuerpo: "Ya tenés acceso a este curso gracias a tu suscripción al catálogo.",
    recipients: [{ userId: user.id, email: user.email as string }],
  });

  revalidatePath(`/cursos/${courseSlug}`);
  return {};
}
