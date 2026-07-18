"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { notifyUsers } from "@/lib/notifications";
import { tutoriaFormSchema } from "@/modules/tutorias/tutorias";

export interface TutoriaActionState {
  error?: string;
  success?: boolean;
  id?: string;
}

/**
 * Crea una tutoría para un curso. Si es presencial, primero intenta bloquear
 * el aula en Coworking (reserva `institucional`, sin fila en `payments` —
 * mismo criterio que las reservas en lote de Coordinador) y solo si eso sale
 * bien crea la tutoría vinculada a esa reserva. RLS (`can_teach_course`)
 * es quien realmente exige que el usuario sea docente del curso — acá solo
 * se chequea sesión, mismo patrón que el resto de las acciones de docente.
 */
export async function createTutoriaAction(input: unknown): Promise<TutoriaActionState> {
  const parsed = tutoriaFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }
  const { cursoId, modalidad, fecha, horaInicio, duracionHoras, linkVirtual, spaceId } = parsed.data;

  if (modalidad === "virtual" && !linkVirtual) {
    return { error: "Pegá el link de la tutoría virtual" };
  }
  if (modalidad === "presencial" && !spaceId) {
    return { error: "Elegí un aula" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { data: course } = await supabase.from("courses").select("titulo, slug").eq("id", cursoId).single();
  if (!course) {
    return { error: "El curso no existe" };
  }

  const fechaInicio = new Date(`${fecha}T${String(horaInicio).padStart(2, "0")}:00:00`);
  const fechaFin = new Date(fechaInicio.getTime() + duracionHoras * 60 * 60 * 1000);

  let bookingId: string | null = null;

  if (modalidad === "presencial") {
    const { data: space } = await supabase
      .from("spaces")
      .select("precio_hora, activo")
      .eq("id", spaceId)
      .single();

    if (!space || !space.activo) {
      return { error: "Ese aula ya no está disponible" };
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        space_id: spaceId,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        estado: "confirmada",
        monto: Math.round(space.precio_hora * duracionHoras * 100) / 100,
        descuento_pct: 0,
        tipo_descuento: "institucional",
        notas: `Tutoría — ${course.titulo}`,
      })
      .select("id")
      .single();

    if (bookingError || !booking) {
      if (bookingError?.code === "23P01") {
        return { error: "Esa aula ya está ocupada en ese horario — elegí otro horario o espacio" };
      }
      return { error: "No se pudo reservar el aula — intentá de nuevo" };
    }

    bookingId = booking.id;
  }

  const { data: tutoria, error: tutoriaError } = await supabase
    .from("tutorias")
    .insert({
      curso_id: cursoId,
      docente_id: user.id,
      modalidad,
      fecha_inicio: fechaInicio.toISOString(),
      fecha_fin: fechaFin.toISOString(),
      link_virtual: modalidad === "virtual" ? linkVirtual : null,
      space_id: modalidad === "presencial" ? spaceId : null,
      booking_id: bookingId,
    })
    .select("id")
    .single();

  if (tutoriaError || !tutoria) {
    if (bookingId) {
      await supabase.from("bookings").delete().eq("id", bookingId);
    }
    return { error: tutoriaError?.message ?? "No se pudo crear la tutoría" };
  }

  const { data: enrollments } = await supabase.from("enrollments").select("user_id").eq("course_id", cursoId);
  const userIds = (enrollments ?? []).map((e) => e.user_id as string);

  if (userIds.length > 0) {
    const { data: recipients } = await supabase.from("users").select("id, email").in("id", userIds);
    const fechaLabel = fechaInicio.toLocaleString("es-AR");

    await notifyUsers(supabase, {
      tipo: "tutoria",
      courseId: cursoId,
      senderId: user.id,
      referenciaId: tutoria.id,
      titulo: `Nueva tutoría en ${course.titulo}`,
      cuerpo: `Tutoría ${modalidad} el ${fechaLabel}.`,
      recipients: (recipients ?? []).map((r) => ({ userId: r.id as string, email: r.email as string })),
      emailSubject: `[${course.titulo}] Nueva tutoría programada`,
    });
  }

  revalidatePath(`/docente/cursos/${cursoId}/tutorias`);
  revalidatePath(`/cursos/${course.slug}`);
  return { success: true, id: tutoria.id };
}

export async function cancelTutoriaAction(tutoriaId: string, cursoId: string): Promise<TutoriaActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { data: tutoria } = await supabase
    .from("tutorias")
    .select("booking_id, modalidad, fecha_inicio")
    .eq("id", tutoriaId)
    .single();

  if (!tutoria) {
    return { error: "La tutoría no existe" };
  }

  const { error } = await supabase.from("tutorias").update({ estado: "cancelada" }).eq("id", tutoriaId);
  if (error) {
    return { error: error.message };
  }

  if (tutoria.booking_id) {
    await supabase.from("bookings").update({ estado: "cancelada" }).eq("id", tutoria.booking_id);
  }

  const { data: enrollments } = await supabase.from("enrollments").select("user_id").eq("course_id", cursoId);
  const userIds = (enrollments ?? []).map((e) => e.user_id as string);

  if (userIds.length > 0) {
    const { data: recipients } = await supabase.from("users").select("id, email").in("id", userIds);

    await notifyUsers(supabase, {
      tipo: "tutoria",
      courseId: cursoId,
      referenciaId: tutoriaId,
      titulo: "Tutoría cancelada",
      cuerpo: `La tutoría del ${new Date(tutoria.fecha_inicio).toLocaleString("es-AR")} fue cancelada.`,
      recipients: (recipients ?? []).map((r) => ({ userId: r.id as string, email: r.email as string })),
      emailSubject: "Tutoría cancelada",
    });
  }

  const { data: course } = await supabase.from("courses").select("slug").eq("id", cursoId).single();
  revalidatePath(`/docente/cursos/${cursoId}/tutorias`);
  if (course?.slug) revalidatePath(`/cursos/${course.slug}`);
  return { success: true };
}

export async function registrarAsistenciaAction(
  tutoriaId: string,
  cursoId: string,
  asistencia: { alumnoId: string; presente: boolean }[]
): Promise<TutoriaActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase.from("tutoria_asistencias").upsert(
    asistencia.map((a) => ({
      tutoria_id: tutoriaId,
      alumno_id: a.alumnoId,
      presente: a.presente,
      registrado_at: new Date().toISOString(),
    })),
    { onConflict: "tutoria_id,alumno_id" }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/docente/cursos/${cursoId}/tutorias/${tutoriaId}`);
  return { success: true };
}

export async function cargarGrabacionAction(
  tutoriaId: string,
  cursoId: string,
  grabacionUrl: string
): Promise<TutoriaActionState> {
  if (!grabacionUrl.trim()) {
    return { error: "Pegá el link de la grabación" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase
    .from("tutorias")
    .update({ grabacion_url: grabacionUrl.trim() })
    .eq("id", tutoriaId);

  if (error) {
    return { error: error.message };
  }

  const { data: course } = await supabase.from("courses").select("slug").eq("id", cursoId).single();
  revalidatePath(`/docente/cursos/${cursoId}/tutorias/${tutoriaId}`);
  if (course?.slug) revalidatePath(`/cursos/${course.slug}`);
  return { success: true };
}
