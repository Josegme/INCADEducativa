import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export default async function CoworkingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen w-full bg-edu-bg">
      <header className="flex h-[46px] items-center justify-between border-b-[0.5px] border-[--edu-border] bg-black/[0.55] px-4 backdrop-blur-[8px]">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[--inc-violet] text-[11px] font-semibold text-white">
            IN
          </span>
          <span className="text-[13px] font-semibold text-white">Coworking</span>
        </Link>
        <Link
          href={user ? "/dashboard" : "/login"}
          className="rounded-md border-[0.5px] border-[--inc-violet-border-strong] px-3 py-1.5 text-[13px] font-semibold text-[--inc-violet] hover:bg-[--inc-violet-subtle]"
        >
          {user ? "Ir a mi panel" : "Ingresar"}
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
