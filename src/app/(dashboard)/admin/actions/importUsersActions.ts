"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { csvRowSchema, type ImportPreviewRow } from "@/modules/admin/importUsers";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    throw new Error("Solo el administrador puede importar usuarios");
  }

  return { supabase, user };
}

export interface PreviewImportResult {
  error?: string;
  fileName?: string;
  rows?: ImportPreviewRow[];
}

export async function previewImportAction(formData: FormData): Promise<PreviewImportResult> {
  const { supabase } = await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "No se recibió ningún archivo" };
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parsed.errors.length > 0) {
    return { error: "El CSV tiene un formato inválido — revisá las columnas" };
  }

  if (parsed.data.length === 0) {
    return { error: "El archivo no tiene filas para importar" };
  }

  const { data: careers } = await supabase.from("careers").select("id, nombre");
  const careerByName = new Map((careers ?? []).map((c) => [c.nombre.trim().toLowerCase(), c.id as string]));

  const candidateEmails = parsed.data.map((r) => r.email?.trim().toLowerCase()).filter(Boolean);
  const candidateDnis = parsed.data.map((r) => r.dni?.trim()).filter(Boolean);

  const [{ data: byEmail }, { data: byDni }] = await Promise.all([
    candidateEmails.length
      ? supabase.from("users").select("email").in("email", candidateEmails)
      : Promise.resolve({ data: [] as { email: string }[] }),
    candidateDnis.length
      ? supabase.from("users").select("dni").in("dni", candidateDnis)
      : Promise.resolve({ data: [] as { dni: string | null }[] }),
  ]);

  const existingEmails = new Set((byEmail ?? []).map((u) => u.email.toLowerCase()));
  const existingDnis = new Set((byDni ?? []).map((u) => u.dni).filter((d): d is string => !!d));

  const seenEmails = new Set<string>();
  const seenDnis = new Set<string>();

  const rows: ImportPreviewRow[] = parsed.data.map((raw) => {
    const base = {
      nombre: raw.nombre ?? "",
      apellido: raw.apellido ?? "",
      dni: raw.dni ?? "",
      email: raw.email ?? "",
      carrera: raw.carrera ?? "",
    };

    const parsedRow = csvRowSchema.safeParse(base);
    if (!parsedRow.success) {
      return { ...base, status: "error", motivo: parsedRow.error.issues[0]?.message };
    }

    const { nombre, apellido, dni, email, carrera } = parsedRow.data;

    if (existingEmails.has(email) || existingDnis.has(dni) || seenEmails.has(email) || seenDnis.has(dni)) {
      return { nombre, apellido, dni, email, carrera, status: "duplicado", motivo: "Ya existe o está repetido en el archivo" };
    }

    const carreraId = careerByName.get(carrera.toLowerCase());
    if (!carreraId) {
      return { nombre, apellido, dni, email, carrera, status: "error", motivo: "Carrera sin coincidencia en el sistema" };
    }

    seenEmails.add(email);
    seenDnis.add(dni);

    return { nombre, apellido, dni, email, carrera, status: "nuevo", carreraId };
  });

  return { fileName: file.name, rows };
}

export interface ConfirmImportResult {
  error?: string;
  imported?: number;
  failed?: { email: string; motivo: string }[];
}

export async function confirmImportAction(rows: ImportPreviewRow[]): Promise<ConfirmImportResult> {
  const { supabase } = await requireAdmin();

  const candidates = rows.filter((r) => r.status === "nuevo" && r.carreraId);
  if (candidates.length === 0) {
    return { error: "No hay filas nuevas para importar" };
  }

  const emails = candidates.map((r) => r.email.toLowerCase());
  const { data: existing } = await supabase.from("users").select("email").in("email", emails);
  const alreadyExists = new Set((existing ?? []).map((u) => u.email.toLowerCase()));

  const admin = createAdminClient();
  let imported = 0;
  const failed: { email: string; motivo: string }[] = [];

  for (const row of candidates) {
    if (alreadyExists.has(row.email.toLowerCase())) {
      failed.push({ email: row.email, motivo: "Ya existe (detectado al confirmar)" });
      continue;
    }

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(row.email);
    if (inviteError || !invited.user) {
      failed.push({ email: row.email, motivo: "No se pudo crear la cuenta de acceso" });
      continue;
    }

    const { error: insertError } = await supabase.from("users").insert({
      id: invited.user.id,
      email: row.email,
      nombre: row.nombre,
      apellido: row.apellido,
      dni: row.dni,
      carrera_id: row.carreraId,
      role: "alumno",
    });

    if (insertError) {
      await admin.auth.admin.deleteUser(invited.user.id);
      failed.push({ email: row.email, motivo: "No se pudo crear el perfil" });
      continue;
    }

    imported++;
  }

  revalidatePath("/admin/usuarios");

  return { imported, failed };
}
