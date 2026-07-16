"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { notifyUsers } from "@/lib/notifications";
import { manualBookingFormSchema } from "@/modules/admin/bookings";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    throw new Error("Solo el administrador puede gestionar reservas de Coworking");
  }

  return { supabase, user };
}

export interface BookingActionState {
  error?: string;
  success?: boolean;
  count?: number;
  completedCount?: number;
}

const REVALIDATE_PATHS = [
  "/admin/coworking/reservas",
  "/admin/coworking/ocupacion",
  "/admin/coworking/ingresos",
];

function revalidateBookingPaths() {
  for (const path of REVALIDATE_PATHS) revalidatePath(path);
}

export async function createManualBookingAction(formData: FormData): Promise<BookingActionState> {
  const { supabase } = await requireAdmin();

  const parsed = manualBookingFormSchema.safeParse({
    userId: formData.get("userId"),
    spaceId: formData.get("spaceId"),
    fecha: formData.get("fecha"),
    horaInicio: formData.get("horaInicio"),
    duracionHoras: formData.get("duracionHoras"),
    notas: formData.get("notas") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { userId, spaceId, fecha, horaInicio, duracionHoras, notas } = parsed.data;

  const { data: space } = await supabase
    .from("spaces")
    .select("precio_hora, activo")
    .eq("id", spaceId)
    .single();

  if (!space) {
    return { error: "El espacio elegido no existe" };
  }

  const fechaInicio = new Date(`${fecha}T00:00:00`);
  fechaInicio.setHours(horaInicio, 0, 0, 0);
  const fechaFin = new Date(fechaInicio);
  fechaFin.setHours(fechaInicio.getHours() + duracionHoras);

  const monto = Math.round(space.precio_hora * duracionHoras * 100) / 100;

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      user_id: userId,
      space_id: spaceId,
      fecha_inicio: fechaInicio.toISOString(),
      fecha_fin: fechaFin.toISOString(),
      estado: "confirmada",
      monto,
      descuento_pct: 0,
      tipo_descuento: "manual",
      notas: notas || null,
    })
    .select("id")
    .single();

  if (bookingError) {
    if (bookingError.code === "23P01") {
      return { error: "Ese horario ya no está disponible para este espacio" };
    }
    return { error: bookingError.message };
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    booking_id: booking.id,
    monto,
    estado: "aprobado",
  });

  if (paymentError) {
    return { error: paymentError.message };
  }

  revalidateBookingPaths();
  return { success: true };
}

export async function cancelBookingAction(bookingId: string): Promise<BookingActionState> {
  const { supabase } = await requireAdmin();

  const { data: booking } = await supabase
    .from("bookings")
    .select("user_id, space_id, fecha_inicio")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return { error: "La reserva no existe" };
  }

  const { error } = await supabase.from("bookings").update({ estado: "cancelada" }).eq("id", bookingId);

  if (error) {
    return { error: error.message };
  }

  const [{ data: profile }, { data: space }] = await Promise.all([
    supabase.from("users").select("email, nombre").eq("id", booking.user_id).single(),
    supabase.from("spaces").select("nombre").eq("id", booking.space_id).single(),
  ]);

  if (profile?.email) {
    const fecha = new Date(booking.fecha_inicio).toLocaleString("es-AR");
    const espacioNombre = space?.nombre ?? "tu espacio";

    await notifyUsers(supabase, {
      tipo: "reserva",
      referenciaId: bookingId,
      titulo: `Tu reserva de ${espacioNombre} fue cancelada`,
      cuerpo: `La reserva del ${fecha} fue cancelada por el administrador.`,
      recipients: [{ userId: booking.user_id, email: profile.email as string }],
      emailSubject: "Reserva de Coworking cancelada",
    });
  }

  revalidateBookingPaths();
  return { success: true };
}

export async function checkInBookingAction(
  bookingId: string,
  metodo: "manual" | "qr"
): Promise<BookingActionState> {
  const { supabase, user } = await requireAdmin();

  const { data: booking } = await supabase
    .from("bookings")
    .select("estado, fecha_inicio, fecha_fin")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return { error: "La reserva no existe" };
  }

  if (booking.estado !== "confirmada") {
    return { error: "La reserva no está confirmada" };
  }

  if (metodo === "qr") {
    const now = Date.now();
    const inicio = new Date(booking.fecha_inicio).getTime() - 15 * 60 * 1000;
    const fin = new Date(booking.fecha_fin).getTime();

    if (now < inicio || now > fin) {
      return { error: "Fuera de la ventana horaria de la reserva (±15 min)" };
    }
  }

  const { error: checkinError } = await supabase.from("checkins").insert({
    booking_id: bookingId,
    metodo,
    registrado_por: user.id,
  });

  if (checkinError) {
    return { error: checkinError.message };
  }

  const { error: updateError } = await supabase.from("bookings").update({ estado: "en_uso" }).eq("id", bookingId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidateBookingPaths();
  return { success: true };
}

/**
 * Dispara a mano las 2 detecciones automáticas de Coworking (mismas RPCs
 * que llama /api/cron/coworking cada 5-10 min): no-shows y reservas
 * terminadas que quedan en `completada`.
 */
export async function runNoShowDetectionAction(): Promise<BookingActionState> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase.rpc("detect_no_shows");
  if (error) {
    return { error: error.message };
  }

  const { data: completedData, error: completedError } = await supabase.rpc("detect_completed_bookings");
  if (completedError) {
    return { error: completedError.message };
  }

  revalidatePath("/admin/coworking/ocupacion");
  return { success: true, count: (data as number) ?? 0, completedCount: (completedData as number) ?? 0 };
}
