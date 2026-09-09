import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AnnouncementComposer } from "@/components/docente/AnnouncementComposer";
import { AnnouncementList } from "@/components/educativa/AnnouncementList";
import type { AnnouncementRow } from "@/modules/comunicacion/types";
import { createClient } from "@/lib/supabase/server";

export default async function DocenteAnnouncementsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("id, titulo").eq("id", params.id).single();

  if (!course) {
    notFound();
  }

  const { data: rows } = await supabase
    .from("announcements")
    .select("id, course_id, sender_id, titulo, body, attachment_url, created_at, sender:users!announcements_sender_id_fkey(nombre, apellido)")
    .eq("course_id", params.id)
    .order("created_at", { ascending: false });

  const announcements: AnnouncementRow[] = (rows ?? []).map((row) => {
    const sender = row.sender as unknown as { nombre: string; apellido: string } | null;
    return {
      id: row.id as string,
      course_id: row.course_id as string,
      sender_id: row.sender_id as string,
      titulo: row.titulo as string | null,
      body: row.body as string,
      attachment_url: row.attachment_url as string | null,
      created_at: row.created_at as string,
      sender_nombre: sender?.nombre ?? "Usuario",
      sender_apellido: sender?.apellido ?? "",
    };
  });

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Link
        href={`/docente/cursos/${course.id}`}
        className="flex w-fit items-center gap-1 text-[13px] text-[--edu-text-muted] hover:text-[--edu-text]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a {course.titulo}
      </Link>

      <h1 className="text-[20px] font-semibold text-white">Anuncios — {course.titulo}</h1>

      <AnnouncementComposer courseId={course.id} />

      <AnnouncementList announcements={announcements} />
    </div>
  );
}
