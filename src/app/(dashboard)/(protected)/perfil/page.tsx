import { redirect } from "next/navigation";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { AvatarUploader } from "@/components/perfil/AvatarUploader";
import { getSignedAvatarUrl } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/server";

function initialsFor(nombre?: string | null, apellido?: string | null) {
  return `${nombre?.charAt(0) ?? ""}${apellido?.charAt(0) ?? ""}`.toUpperCase() || undefined;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function PerfilPage({ searchParams }: { searchParams: { onboarding?: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: pointsLog }, { count: enrollmentsCount }, { count: certificatesCount }] =
    await Promise.all([
      supabase
        .from("users")
        .select("nombre, apellido, role, avatar_url, puntos, created_at, carrera:careers(nombre)")
        .eq("id", user.id)
        .single(),
      supabase
        .from("points_log")
        .select("puntos, motivo, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("certificates").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

  const carrera = profile?.carrera as unknown as { nombre: string } | null;
  const avatarSignedUrl = profile?.avatar_url ? await getSignedAvatarUrl(supabase, profile.avatar_url) : null;

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Mi perfil</h1>
        <p className="text-sm text-[--edu-text-muted]">Tu información personal y tu historial en la plataforma.</p>
      </div>

      {searchParams.onboarding === "1" ? (
        <NotificationBanner type="info">
          <div className="flex flex-col items-start gap-2">
            <span>¡Bienvenido/a a INCADEducativa! Antes de arrancar, ¿le sumás una foto a tu perfil?</span>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Continuar sin foto</Link>
            </Button>
          </div>
        </NotificationBanner>
      ) : null}

      <Card className="flex items-center gap-5 p-5">
        <AvatarUploader
          userId={user.id}
          initialSignedUrl={avatarSignedUrl}
          initials={initialsFor(profile?.nombre, profile?.apellido)}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-[16px] font-semibold text-white">
            {profile?.nombre} {profile?.apellido}
          </span>
          <span className="text-[13px] text-[--edu-text-muted]">{user.email}</span>
          <div className="flex items-center gap-2 pt-1">
            <Badge className="capitalize">{profile?.role}</Badge>
            <span className="text-[12px] text-[--edu-text-faint]">
              {carrera ? carrera.nombre : "Sin carrera asignada"}
            </span>
          </div>
          {profile?.created_at ? (
            <span className="text-[11px] text-[--edu-text-faint]">Miembro desde {formatFecha(profile.created_at)}</span>
          ) : null}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col gap-1 p-4">
          <span className="text-[24px] font-semibold text-white">{enrollmentsCount ?? 0}</span>
          <span className="text-[12px] text-[--edu-text-muted]">Cursos inscriptos</span>
        </Card>
        <Card className="flex flex-col gap-1 p-4">
          <span className="text-[24px] font-semibold text-white">{certificatesCount ?? 0}</span>
          <span className="text-[12px] text-[--edu-text-muted]">Certificados obtenidos</span>
        </Card>
      </div>

      <Card className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-white">Historial de puntos</h2>
          <span className="text-[13px] font-semibold text-[--inc-violet-text]">{profile?.puntos ?? 0} pts</span>
        </div>

        {pointsLog && pointsLog.length > 0 ? (
          <ul className="flex flex-col divide-y divide-[--edu-border]">
            {pointsLog.map((entry, idx) => (
              <li key={idx} className="flex items-center justify-between py-2 text-[13px]">
                <div className="flex flex-col">
                  <span className="text-[--edu-text-muted]">{entry.motivo}</span>
                  <span className="text-[11px] text-[--edu-text-faint]">{formatFecha(entry.created_at)}</span>
                </div>
                <span className={entry.puntos >= 0 ? "text-[--edu-success-text]" : "text-[--edu-danger-text]"}>
                  {entry.puntos >= 0 ? "+" : ""}
                  {entry.puntos}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-[--edu-text-muted]">Todavía no tenés movimientos de puntos.</p>
        )}
      </Card>
    </div>
  );
}
