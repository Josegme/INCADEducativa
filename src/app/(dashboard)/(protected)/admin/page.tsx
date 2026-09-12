import Link from "next/link";
import { BookOpen, ClipboardList, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const [{ count: users }, { count: review }, { count: published }] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true }).eq("estado", "revision"),
    supabase.from("courses").select("id", { count: "exact", head: true }).eq("estado", "publicado"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Administración" description="Resumen operativo de INCADEducativa." />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <Users className="mb-2 h-5 w-5 text-[--inc-violet-text]" aria-hidden />
          <p className="text-caption text-[--edu-text-muted]">Usuarios</p>
          <p className="text-title font-semibold text-white">{users ?? 0}</p>
        </Card>
        <Card className="p-4">
          <ClipboardList className="mb-2 h-5 w-5 text-[--edu-warning-text]" aria-hidden />
          <p className="text-caption text-[--edu-text-muted]">En revisión</p>
          <p className="text-title font-semibold text-white">{review ?? 0}</p>
        </Card>
        <Card className="p-4">
          <BookOpen className="mb-2 h-5 w-5 text-[--edu-success-text]" aria-hidden />
          <p className="text-caption text-[--edu-text-muted]">Cursos publicados</p>
          <p className="text-title font-semibold text-white">{published ?? 0}</p>
        </Card>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/admin/cursos">Cola de revisión</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/usuarios">Gestionar usuarios</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/suscripciones">Suscripciones</Link>
        </Button>
      </div>
    </div>
  );
}
