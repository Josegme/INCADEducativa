"use server";

import { redirect } from "next/navigation";

import { createBookingPreference } from "@/lib/mercadopago/preference";
import { notifyUsers } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { bookingFormSchema, computeBookingAmount, registerFieldsSchema } from "@/modules/coworking/booking";

export interface BookingActionState {
  error?: string;
  success?: boolean;
}

/** "Nueva reserva recibida" al admin — dispara en ambas ramas (pago online
 * y canje de crédito), apenas se crea la reserva, sin esperar confirmación
 * de pago (a diferencia del comprobante, que sí espera el webhook). */
async function notifyAdminsNewBooking(
  admin: ReturnType<typeof createAdminClient>,
  bookingId: string,
  espacioNombre: string,
  fecha: string,
  usuarioNombre: string
) {
  const { data: admins } = await admin.from("users").select("id, email").eq("role", "admin");
  if (!admins || admins.length === 0) return;

  await notifyUsers(admin, {
    tipo: "reserva",
    referenciaId: bookingId,
    titulo: `Nueva reserva — ${espacioNombre}`,
    cuerpo: `${usuarioNombre} reservó ${espacioNombre} para el ${fecha}.`,
    recipients: admins.map((a) => ({ userId: a.id as string, email: a.email as string })),
    emailSubject: "Nueva reserva de Coworking",
  });
}

/**
 * Registro mínimo + reserva en un solo paso (CU-06). El registro de
 * `comunidad` sin cuenta previa es una excepción acotada al flujo de
 * Coworking — CLAUDE.md regla #2 (v3.5) — nunca un alta general de la
 * plataforma.
 */
export async function createBookingAction(formData: FormData): Promise<BookingActionState> {
  const parsed = bookingFormSchema.safeParse({
    spaceId: formData.get("spaceId"),
    fecha: formData.get("fecha"),
    horaInicio: formData.get("horaInicio"),
    duracionHoras: formData.get("duracionHoras"),
    telefonoContacto: formData.get("telefonoContacto") || undefined,
    cuponCodigo: formData.get("cuponCodigo") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { spaceId, fecha, horaInicio, duracionHoras, telefonoContacto, cuponCodigo } = parsed.data;

  const supabase = await createClient();
  const admin = createAdminClient();

  let {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const registerParsed = registerFieldsSchema.safeParse({
      nombre: formData.get("nombre"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!registerParsed.success) {
      return { error: registerParsed.error.issues[0]?.message ?? "Completá tus datos para reservar" };
    }

    const { nombre, email, password } = registerParsed.data;

    const { data: existing } = await admin.from("users").select("id").eq("email", email.toLowerCase()).maybeSingle();
    if (existing) {
      return { error: "Ya existe una cuenta con ese email — iniciá sesión para reservar" };
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

  const { data: space } = await supabase
    .from("spaces")
    .select("id, nombre, precio_hora, activo, location_id")
    .eq("id", spaceId)
    .single();

  if (!space || !space.activo) {
    return { error: "Este espacio ya no está disponible" };
  }

  const { data: location } = await supabase.from("locations").select("nombre").eq("id", space.location_id).single();

  // Pago con crédito canjeado (Sprint 19-20) — rama separada del pago en
  // efectivo, no toca la lógica de MercadoPago de más abajo. Sin fila en
  // `payments` (no es revenue real, mismo criterio que las reservas
  // institucionales de coordinador).
  if (formData.get("pagarConCredito") === "true") {
    const { data: profile } = await supabase
      .from("users")
      .select("coworking_creditos_canje")
      .eq("id", user.id)
      .single();
    const creditosDisponibles = profile?.coworking_creditos_canje ?? 0;

    if (creditosDisponibles < duracionHoras) {
      return { error: "No tenés créditos suficientes para esta duración" };
    }

    const fechaInicioCredito = new Date(`${fecha}T${String(horaInicio).padStart(2, "0")}:00:00`);
    const fechaFinCredito = new Date(fechaInicioCredito.getTime() + duracionHoras * 60 * 60 * 1000);
    const montoReferencia = Math.round(space.precio_hora * duracionHoras * 100) / 100;

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .insert({
        user_id: user.id,
        space_id: spaceId,
        fecha_inicio: fechaInicioCredito.toISOString(),
        fecha_fin: fechaFinCredito.toISOString(),
        estado: "confirmada",
        monto: montoReferencia,
        descuento_pct: 100,
        tipo_descuento: "canje",
        telefono_contacto: telefonoContacto || null,
      })
      .select("id")
      .single();

    if (bookingError || !booking) {
      if (bookingError?.code === "23P01") {
        return { error: "Ese horario ya no está disponible — elegí otro" };
      }
      return { error: "No se pudo crear la reserva — intentá de nuevo" };
    }

    await admin
      .from("users")
      .update({ coworking_creditos_canje: creditosDisponibles - duracionHoras })
      .eq("id", user.id);

    await notifyAdminsNewBooking(
      admin,
      booking.id,
      space.nombre,
      fechaInicioCredito.toLocaleString("es-AR"),
      user.email
    );

    redirect(`/servicios/coworking/reservas/${booking.id}`);
  }

  // Cupón (early bird/promoción) — si es válido, gana por sobre el
  // descuento institucional automático (no se acumulan). select vía la
  // sesión del usuario (coupons_select ya lo permite, 002); el canje
  // (usos_actuales) va por RPC atómica porque la escritura directa es
  // admin-only (coupons_admin).
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
        montoOriginal: Math.round(space.precio_hora * duracionHoras * 100) / 100,
        montoFinal: Math.round(space.precio_hora * duracionHoras * (1 - coupon.descuento_pct / 100) * 100) / 100,
        descuentoPct: coupon.descuento_pct,
        tipoDescuento: "cupon" as const,
      }
    : computeBookingAmount(space.precio_hora, duracionHoras, descuentoPctInstitucional);

  // El canje se hace ANTES de insertar la reserva: increment_coupon_usage()
  // ahora es atómico (chequea usos_maximos y suma en la misma sentencia,
  // migración 034) para que dos reservas concurrentes con el mismo código no
  // superen el límite. Si el insert de la reserva falla después, se libera
  // el cupón con decrement_coupon_usage().
  if (coupon) {
    const { data: redeemed } = await supabase.rpc("increment_coupon_usage", { p_coupon_id: coupon.id });
    if (!redeemed) {
      return { error: "Ese cupón alcanzó su límite de usos. Probá sin cupón o con otro código." };
    }
  }

  const fechaInicio = new Date(`${fecha}T${String(horaInicio).padStart(2, "0")}:00:00`);
  const fechaFin = new Date(fechaInicio.getTime() + duracionHoras * 60 * 60 * 1000);

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      space_id: spaceId,
      fecha_inicio: fechaInicio.toISOString(),
      fecha_fin: fechaFin.toISOString(),
      monto: amount.montoFinal,
      descuento_pct: amount.descuentoPct,
      tipo_descuento: amount.tipoDescuento,
      telefono_contacto: telefonoContacto || null,
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    if (coupon) {
      await supabase.rpc("decrement_coupon_usage", { p_coupon_id: coupon.id });
    }
    if (bookingError?.code === "23P01") {
      return { error: "Ese horario ya no está disponible — elegí otro" };
    }
    return { error: "No se pudo crear la reserva — intentá de nuevo" };
  }

  // payments es de escritura exclusiva del sistema (RLS solo permite admin) —
  // el webhook es la única fuente de verdad del estado (CLAUDE.md regla #9).
  const preference = await createBookingPreference({
    bookingId: booking.id,
    title: `${space.nombre} — ${location?.nombre ?? "Coworking INCADE"}`,
    unitPrice: amount.montoFinal,
    payerEmail: user.email,
  });

  await admin.from("payments").insert({
    booking_id: booking.id,
    monto: amount.montoFinal,
    mp_preference_id: preference?.preferenceId ?? null,
  });

  await notifyAdminsNewBooking(admin, booking.id, space.nombre, fechaInicio.toLocaleString("es-AR"), user.email);

  if (preference) {
    redirect(preference.initPoint);
  }

  redirect(`/servicios/coworking/reservas/${booking.id}`);
}

/**
 * Cancelación de la propia reserva — hueco real de Sprint 15-16 (solo el
 * admin podía cancelar). RLS `bookings_own` ya permite el UPDATE porque
 * `user_id = auth.uid()`; igual se chequea acá explícito antes de tocar
 * nada, por claridad.
 */
export async function cancelMyBookingAction(bookingId: string): Promise<BookingActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Necesitás iniciar sesión" };
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("user_id, space_id, fecha_inicio")
    .eq("id", bookingId)
    .single();

  if (!booking || booking.user_id !== user.id) {
    return { error: "No encontramos esa reserva" };
  }

  const { error } = await supabase.from("bookings").update({ estado: "cancelada" }).eq("id", bookingId);
  if (error) {
    return { error: error.message };
  }

  // users_select/notifications_own de RLS solo dejan ver/insertar la fila
  // propia (o admin) — un usuario no-admin no puede leer otros perfiles ni
  // insertar una notificación para el admin, así que este paso puntual usa
  // el cliente service_role, mismo criterio que el registro inline de
  // createBookingAction.
  const admin = createAdminClient();
  const { data: space } = await admin.from("spaces").select("nombre").eq("id", booking.space_id).single();
  const { data: admins } = await admin.from("users").select("id, email").eq("role", "admin");

  if (admins && admins.length > 0) {
    const fecha = new Date(booking.fecha_inicio).toLocaleString("es-AR");
    await notifyUsers(admin, {
      tipo: "reserva",
      referenciaId: bookingId,
      titulo: `Un usuario canceló su reserva de ${space?.nombre ?? "un espacio"}`,
      cuerpo: `La reserva del ${fecha} fue cancelada por el propio usuario.`,
      recipients: admins.map((a) => ({ userId: a.id, email: a.email as string })),
    });
  }

  return { success: true };
}
