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
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { spaceId, fecha, horaInicio, duracionHoras, telefonoContacto } = parsed.data;

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

  const { data: discountData } = await supabase.rpc("get_user_discount");
  const descuentoPct = typeof discountData === "number" ? discountData : 0;

  const amount = computeBookingAmount(space.precio_hora, duracionHoras, descuentoPct);

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
