"use server";

import { redirect } from "next/navigation";

import { getFlags } from "@/lib/flags";
import { createCoursePreference } from "@/lib/mercadopago/preference";
import { notifyUsers } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { computeCoursePurchaseAmount, purchaseFormSchema } from "@/modules/educativa/coursePurchase";
import { registerFieldsSchema } from "@/modules/coworking/booking";

export interface PurchaseCourseState {
  error?: string;
}

/**
 * "Nueva compra recibida" al admin — dispara apenas se crea la compra, sin
 * esperar la confirmación del webhook (mismo criterio que
 * notifyAdminsNewBooking en bookingActions.ts).
 */
async function notifyAdminsNewCoursePurchase(
  admin: ReturnType<typeof createAdminClient>,
  compraId: string,
  courseTitle: string,
  usuarioNombre: string
) {
  const { data: admins } = await admin.from("users").select("id, email").eq("role", "admin");
  if (!admins || admins.length === 0) return;

  await notifyUsers(admin, {
    tipo: "sistema",
    referenciaId: compraId,
    titulo: `Nueva compra de curso — ${courseTitle}`,
    cuerpo: `${usuarioNombre} inició la compra de "${courseTitle}".`,
    recipients: admins.map((a) => ({ userId: a.id as string, email: a.email as string })),
    emailSubject: "Nueva compra de curso",
  });
}

/**
 * Compra individual de un curso pago (Etapa 3). Un visitante sin cuenta se
 * autorregistra en el mismo paso — a diferencia del registro de `lead` vía
 * taller gratuito (tallerInscripcionActions.ts), acá se crea directamente
 * como `comunidad`: aplica la regla general de autorregistro de E3
 * (CLAUDE.md regla #2, "usuarios comunidad SÍ se auto-registran cuando
 * FEATURE_PUBLICA=true"), no la excepción acotada de Coworking (CU-06).
 */
export async function purchaseCourseAction(formData: FormData): Promise<PurchaseCourseState> {
  const parsed = purchaseFormSchema.safeParse({
    courseId: formData.get("courseId"),
    cuponCodigo: formData.get("cuponCodigo") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { courseId, cuponCodigo } = parsed.data;

  const supabase = await createClient();
  const admin = createAdminClient();

  let {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const flags = await getFlags();
    if (!flags.publica) {
      return { error: "Iniciá sesión para comprar este curso" };
    }

    const registerParsed = registerFieldsSchema.safeParse({
      nombre: formData.get("nombre"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!registerParsed.success) {
      return { error: registerParsed.error.issues[0]?.message ?? "Completá tus datos para comprar" };
    }

    const { nombre, email, password } = registerParsed.data;

    const { data: existing } = await admin.from("users").select("id").eq("email", email.toLowerCase()).maybeSingle();
    if (existing) {
      return { error: "Ya existe una cuenta con ese email — iniciá sesión para comprar" };
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

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, titulo, precio, es_gratuito, estado")
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
    return { error: "Ya estás inscripto en este curso" };
  }

  // Cupón (si viene) gana por sobre el descuento institucional automático,
  // sin acumular — mismas reglas/RPCs que bookingActions.ts.
  let coupon: { id: string; descuento_pct: number } | null = null;
  if (cuponCodigo) {
    const hoy = new Date().toISOString().slice(0, 10);
    const { data: foundCoupon } = await supabase
      .from("coupons")
      .select("id, descuento_pct, valido_desde, valido_hasta, usos_maximos, usos_actuales")
      .eq("codigo", cuponCodigo.toUpperCase())
      .eq("activo", true)
      .maybeSingle();

    if (
      !foundCoupon ||
      foundCoupon.valido_desde > hoy ||
      foundCoupon.valido_hasta < hoy ||
      (foundCoupon.usos_maximos !== null && foundCoupon.usos_actuales >= foundCoupon.usos_maximos)
    ) {
      return { error: "Ese cupón no es válido o ya no está disponible" };
    }

    coupon = { id: foundCoupon.id, descuento_pct: foundCoupon.descuento_pct };
  }

  let descuentoPctInstitucional = 0;
  if (!coupon) {
    const { data: discountData } = await supabase.rpc("get_user_discount");
    descuentoPctInstitucional = typeof discountData === "number" ? discountData : 0;
  }

  const amount = coupon
    ? {
        montoOriginal: Math.round(course.precio * 100) / 100,
        montoFinal: Math.round(course.precio * (1 - coupon.descuento_pct / 100) * 100) / 100,
        descuentoPct: coupon.descuento_pct,
        tipoDescuento: "cupon" as const,
      }
    : computeCoursePurchaseAmount(course.precio, descuentoPctInstitucional);

  if (coupon) {
    const { data: redeemed } = await supabase.rpc("increment_coupon_usage", { p_coupon_id: coupon.id });
    if (!redeemed) {
      return { error: "Ese cupón alcanzó su límite de usos. Probá sin cupón o con otro código." };
    }
  }

  const { data: compra, error: compraError } = await admin
    .from("compras_curso")
    .insert({
      user_id: user.id,
      course_id: course.id,
      monto: amount.montoFinal,
      descuento_pct: amount.descuentoPct,
      tipo_descuento: amount.tipoDescuento,
    })
    .select("id")
    .single();

  if (compraError || !compra) {
    if (coupon) {
      await supabase.rpc("decrement_coupon_usage", { p_coupon_id: coupon.id });
    }
    return { error: "No se pudo iniciar la compra — intentá de nuevo" };
  }

  const preference = await createCoursePreference({
    compraId: compra.id,
    courseSlug: course.slug,
    courseTitle: course.titulo,
    unitPrice: amount.montoFinal,
    payerEmail: user.email,
  });

  if (preference) {
    await admin.from("compras_curso").update({ mp_preference_id: preference.preferenceId }).eq("id", compra.id);
  }

  await notifyAdminsNewCoursePurchase(admin, compra.id, course.titulo, user.email);

  if (preference) {
    redirect(preference.initPoint);
  }

  redirect(`/cursos/${course.slug}/compra/${compra.id}`);
}
