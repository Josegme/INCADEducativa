"use server";

import { createClient } from "@/lib/supabase/server";
import { awardPoints } from "@/lib/points";
import { checkAndIssueCertificate } from "@/lib/certificates";

export interface SaveLessonProgressState {
  error?: string;
  success?: boolean;
}

export async function saveLessonProgressAction(
  lessonId: string,
  tiempoVistoSeg: number,
  completada: boolean
): Promise<SaveLessonProgressState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("completada")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  const wasCompleted = existing?.completada === true;

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      tiempo_visto_seg: Math.max(0, Math.round(tiempoVistoSeg)),
      completada: completada || wasCompleted,
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) {
    return { error: error.message };
  }

  if (completada && !wasCompleted) {
    await awardPoints(user.id, 10, "leccion_completada", lessonId);

    const { data: lesson } = await supabase.from("lessons").select("module_id, modules(course_id)").eq("id", lessonId).single();
    const courseId = (lesson?.modules as unknown as { course_id: string } | null)?.course_id;
    if (courseId) {
      await checkAndIssueCertificate(supabase, user.id, courseId);
    }
  }

  return { success: true };
}
