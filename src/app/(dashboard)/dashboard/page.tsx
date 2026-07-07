import { LogoutButton } from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("users").select("nombre, role").eq("id", user.id).single()
    : { data: null };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[20px] font-semibold text-white">
        Hola, {profile?.nombre ?? user?.email}
      </h1>
      <p className="text-sm text-[--edu-text-muted]">
        Rol detectado: <span className="text-white">{profile?.role ?? "alumno"}</span>
      </p>
      <LogoutButton />
    </div>
  );
}
