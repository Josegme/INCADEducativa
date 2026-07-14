"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface NotificationActionState {
  error?: string;
  success?: boolean;
}

export async function markNotificationReadAction(notificationId: string): Promise<NotificationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase.from("notifications").update({ leida: true }).eq("id", notificationId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function markAllNotificationsReadAction(): Promise<NotificationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase.from("notifications").update({ leida: true }).eq("user_id", user.id).eq("leida", false);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function markAnnouncementReadAction(announcementId: string, courseSlug: string): Promise<NotificationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase
    .from("announcement_reads")
    .upsert({ announcement_id: announcementId, user_id: user.id }, { onConflict: "announcement_id,user_id" });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/cursos/${courseSlug}`);
  return { success: true };
}

export async function markAllAnnouncementsReadAction(courseId: string, courseSlug: string): Promise<NotificationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { data: announcements } = await supabase.from("announcements").select("id").eq("course_id", courseId);
  const ids = (announcements ?? []).map((a) => a.id as string);

  if (ids.length > 0) {
    const { error } = await supabase
      .from("announcement_reads")
      .upsert(
        ids.map((id) => ({ announcement_id: id, user_id: user.id })),
        { onConflict: "announcement_id,user_id" }
      );

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath(`/cursos/${courseSlug}`);
  return { success: true };
}

export interface NotificationPrefs {
  email: boolean;
  whatsapp: boolean;
}

export async function updateNotificationPrefsAction(prefs: NotificationPrefs): Promise<NotificationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase.from("users").update({ notification_prefs: prefs }).eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
