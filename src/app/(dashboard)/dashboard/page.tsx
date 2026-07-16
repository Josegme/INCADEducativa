import { LogoutButton } from "@/components/auth/LogoutButton";
import { NotificationPrefsToggle } from "@/components/educativa/NotificationPrefsToggle";
import { PointsHistory } from "@/components/educativa/PointsHistory";
import { MembershipStatus } from "@/components/coworking/MembershipStatus";
import type { NotificationPrefs } from "@/app/(dashboard)/actions/notificationActions";
import { flags } from "@/lib/flags";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("users").select("nombre, role, puntos, notification_prefs").eq("id", user.id).single()
    : { data: null };

  const notificationPrefs = (profile?.notification_prefs as NotificationPrefs | undefined) ?? {
    email: true,
    whatsapp: true,
  };

  const { data: pointsRows } = user
    ? await supabase
        .from("points_log")
        .select("id, puntos, motivo, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] };

  const { data: membership } =
    user && flags.coworking
      ? await supabase
          .from("memberships")
          .select("activa, fin, creditos_restantes")
          .eq("user_id", user.id)
          .eq("activa", true)
          .maybeSingle()
      : { data: null };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[20px] font-semibold text-white">
        Hola, {profile?.nombre ?? user?.email}
      </h1>
      <p className="text-sm text-[--edu-text-muted]">
        Rol detectado: <span className="text-white">{profile?.role ?? "alumno"}</span>
      </p>
      <PointsHistory total={profile?.puntos ?? 0} rows={pointsRows ?? []} />
      {flags.coworking ? (
        <MembershipStatus
          activa={membership?.activa ?? false}
          creditosRestantes={membership?.creditos_restantes ?? 0}
          fin={membership?.fin ?? null}
        />
      ) : null}
      <NotificationPrefsToggle initialPrefs={notificationPrefs} />
      <LogoutButton />
    </div>
  );
}
