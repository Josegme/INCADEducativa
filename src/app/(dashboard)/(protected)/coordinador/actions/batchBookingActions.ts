"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface BatchBookingState {
  error?: string;
  success?: boolean;
  createdCount?: number;
  failedWeeks?: string[];
}

async function requireCoordinador() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (profile?.role !== "coordinador" && profile?.role !== "admin") {
    throw new Error("Solo coordinadores pueden hacer reservas en lote");
  }

  return { supabase, userId: user.id };
}

/**
 * Reserva institucional en lote — sin pago online (mismo espíritu que
 * createManualBookingAction del admin, Sprint 15-16). No inserta en
 * `payments` a propósito: no es revenue real, es uso institucional interno,
 * no aparece en `coworking_revenue` (decisión documentada).
 */
export async function createBatchBookingAction(formData: FormData): Promise<BatchBookingState> {
  const { supabase, userId } = await requireCoordinador();

  const spaceId = formData.get("spaceId");
  const fecha = formData.get("fecha");
  const horaInicio = Number(formData.get("horaInicio"));
  const duracionHoras = Number(formData.get("duracionHoras"));
  const semanas = Number(formData.get("semanas"));

  if (
    typeof spaceId !== "string" ||
    !spaceId ||
    typeof fecha !== "string" ||
    !fecha ||
    !Number.isFinite(horaInicio) ||
    !Number.isFinite(duracionHoras) ||
    !Number.isFinite(semanas) ||
    semanas < 2 ||
    semanas > 12
  ) {
    return { error: "Datos inválidos" };
  }

  const { data: space } = await supabase.from("spaces").select("precio_hora").eq("id", spaceId).single();
  if (!space) {
    return { error: "El espacio no existe" };
  }

  const { data: discountData } = await supabase.rpc("get_user_discount");
  const descuentoPct = typeof discountData === "number" ? discountData : 0;
  const montoOriginal = Math.round(space.precio_hora * duracionHoras * 100) / 100;
  const monto = descuentoPct > 0 ? Math.round(montoOriginal * (1 - descuentoPct / 100) * 100) / 100 : montoOriginal;

  let created = 0;
  const failedWeeks: string[] = [];

  for (let i = 0; i < semanas; i++) {
    const fechaInicio = new Date(`${fecha}T00:00:00`);
    fechaInicio.setDate(fechaInicio.getDate() + i * 7);
    fechaInicio.setHours(horaInicio, 0, 0, 0);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setHours(fechaInicio.getHours() + duracionHoras);

    const { error } = await supabase.from("bookings").insert({
      user_id: userId,
      space_id: spaceId,
      fecha_inicio: fechaInicio.toISOString(),
      fecha_fin: fechaFin.toISOString(),
      estado: "confirmada",
      monto,
      descuento_pct: descuentoPct,
      tipo_descuento: "institucional",
      notas: "Reserva en lote — coordinador",
    });

    if (error) {
      failedWeeks.push(fechaInicio.toLocaleDateString("es-AR"));
    } else {
      created++;
    }
  }

  revalidatePath("/coordinador/reservas");

  if (created === 0) {
    return { error: "No se pudo crear ninguna reserva — todos los horarios elegidos ya estaban ocupados" };
  }

  return { success: true, createdCount: created, failedWeeks: failedWeeks.length > 0 ? failedWeeks : undefined };
}
