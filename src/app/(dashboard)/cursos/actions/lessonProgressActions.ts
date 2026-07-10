"use server";

import { createClient } from "@/lib/supabase/server";

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

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      tiempo_visto_seg: Math.max(0, Math.round(tiempoVistoSeg)),
      completada: completada || existing?.completada === true,
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
