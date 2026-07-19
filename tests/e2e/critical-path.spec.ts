import { test, expect } from "@playwright/test";
import { createAdminTestClient } from "./supabaseTestClient";

/**
 * FUNCIONALIDADES.md §9.1 — "E2E Etapa 1 (Playwright): inscripción → progreso
 * → examen → certificado". Un solo camino crítico de punta a punta, no un
 * spec por feature (ver decisión de alcance en la sesión de QA de Etapa 1).
 *
 * Fixture: curso/módulo/lección/examen se crean y se borran en cada corrida
 * (cascade real de la 001, no mocks). El usuario alumno es una cuenta QA fija
 * reutilizable entre corridas (`qa.e2e.criticalpath@incadeducativa.com`) —
 * NO se puede borrar al final porque points_log es un ledger append-only
 * (regla #7 de CLAUDE.md: `trg_points_no_delete` bloquea el DELETE incluso en
 * cascada desde el usuario), así que queda como cuenta descartable permanente,
 * mismo criterio que admin.test/alumno.test.
 */

const QA_EMAIL = "qa.e2e.criticalpath@incadeducativa.com";
const QA_PASSWORD = "Test1234!QA";
const CORRECT_OPTION = "Respuesta correcta QA";
const WRONG_OPTION = "Otra opción";

let admin: ReturnType<typeof createAdminTestClient>;
let userId: string;
let courseId: string;
let courseSlug: string;
let evaluationId: string;

test.beforeAll(async () => {
  admin = createAdminTestClient();

  // Usuario QA idempotente — se crea una sola vez, se reutiliza entre corridas.
  const { data: existingProfile } = await admin.from("users").select("id").eq("email", QA_EMAIL).maybeSingle();

  if (existingProfile) {
    userId = existingProfile.id as string;
  } else {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: QA_EMAIL,
      password: QA_PASSWORD,
      email_confirm: true,
    });
    if (createErr || !created.user) throw new Error(`No se pudo crear el usuario QA: ${createErr?.message}`);
    userId = created.user.id;

    const { error: profileErr } = await admin
      .from("users")
      .insert({ id: userId, email: QA_EMAIL, nombre: "QA", apellido: "CriticalPath", role: "alumno" });
    if (profileErr) throw new Error(`No se pudo crear el perfil QA: ${profileErr.message}`);
  }

  // Asegurar que quede en 'alumno' (EnrollButton exige role==='alumno' exacto)
  // y sin inscripciones/certificados de una corrida anterior sobre el mismo email.
  await admin.from("users").update({ role: "alumno" }).eq("id", userId);

  // Fixture de curso — nuevo en cada corrida, se borra en afterAll.
  courseSlug = `qa-camino-critico-${Date.now()}`;
  const { data: course, error: courseErr } = await admin
    .from("courses")
    .insert({
      titulo: "QA Camino Crítico",
      descripcion: "Curso de fixture para el E2E de camino crítico. Descartable.",
      slug: courseSlug,
      estado: "publicado",
      es_gratuito: true,
      nivel: "basico",
    })
    .select("id")
    .single();
  if (courseErr || !course) throw new Error(`No se pudo crear el curso fixture: ${courseErr?.message}`);
  courseId = course.id as string;

  const { data: moduleRow, error: moduleErr } = await admin
    .from("modules")
    .insert({ course_id: courseId, titulo: "Módulo 1", orden: 1 })
    .select("id")
    .single();
  if (moduleErr || !moduleRow) throw new Error(`No se pudo crear el módulo fixture: ${moduleErr?.message}`);

  const { error: lessonErr } = await admin.from("lessons").insert({
    module_id: moduleRow.id,
    titulo: "Clase 1",
    tipo: "texto",
    contenido_text: "Contenido de prueba del E2E de camino crítico.",
    publicada: true,
    orden: 1,
  });
  if (lessonErr) throw new Error(`No se pudo crear la lección fixture: ${lessonErr.message}`);

  const { data: evaluation, error: evalErr } = await admin
    .from("evaluations")
    .insert({
      course_id: courseId,
      module_id: null,
      titulo: "Examen Final QA",
      tipo: "examen_final",
      nota_minima: 60,
      preguntas: [
        {
          id: "q1",
          tipo: "opcion_unica",
          enunciado: "¿Cuál es la respuesta correcta?",
          peso: 100,
          opciones: [CORRECT_OPTION, WRONG_OPTION],
          respuesta_correcta: 0,
          retroalimentacion: "",
        },
      ],
    })
    .select("id")
    .single();
  if (evalErr || !evaluation) throw new Error(`No se pudo crear el examen fixture: ${evalErr?.message}`);
  evaluationId = evaluation.id as string;
});

test.afterAll(async () => {
  // Borra el certificado del bucket (Storage no sigue el cascade de Postgres).
  await admin.storage.from("certificados").remove([`${userId}/${courseId}.pdf`]);
  // El delete del curso cascadea módulos/lecciones/evaluaciones/intentos/
  // inscripción/certificado/notificaciones (todas con on delete cascade
  // desde course_id en la 001/003/009). points_log NO se toca — queda el
  // historial de puntos del usuario QA, es el comportamiento esperado.
  await admin.from("courses").delete().eq("id", courseId);
});

test("camino crítico: inscripción → progreso → examen → certificado", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(QA_EMAIL);
  await page.getByLabel("Contraseña").fill(QA_PASSWORD);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto(`/cursos/${courseSlug}`);
  await expect(page.getByRole("heading", { name: "QA Camino Crítico" })).toBeVisible();
  await page.getByRole("button", { name: "Inscribirme gratis" }).click();
  await expect(page.getByRole("link", { name: /Continuar/ })).toBeVisible();

  await page.getByRole("link", { name: /Continuar/ }).click();
  await expect(page).toHaveURL(/\/lecciones\//);
  await page.getByRole("button", { name: "Marcar como completada" }).click();
  await expect(page.getByText("Completada")).toBeVisible();

  await page.goto(`/cursos/${courseSlug}`);
  const examenLink = page.getByRole("link", { name: /Examen Final QA/ });
  await expect(examenLink).toBeVisible();
  await examenLink.click();
  await expect(page).toHaveURL(/\/evaluaciones\//);

  await page.getByRole("button", { name: CORRECT_OPTION }).click();
  await page.getByRole("button", { name: "Entregar evaluación" }).click();
  await expect(page.getByText(/Aprobada — nota: 100\/100/)).toBeVisible();

  await page.goto("/certificados");
  await expect(page.getByText("QA Camino Crítico")).toBeVisible();
  await expect(page.getByRole("link", { name: /Descargar/ })).toBeVisible();

  // Verificación de estado final directo en DB (más preciso que parsear la UI
  // para los números: puntos exactos, pdf_url, uuid de verificación pública).
  const { data: enrollment } = await admin
    .from("enrollments")
    .select("estado, progreso_pct")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();
  expect(enrollment?.estado).toBe("completado");
  expect(enrollment?.progreso_pct).toBe(100);

  const { data: certificate } = await admin
    .from("certificates")
    .select("uuid_verificacion, pdf_url")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();
  expect(certificate?.pdf_url).toBeTruthy();
  expect(certificate?.uuid_verificacion).toBeTruthy();

  const { data: pointsRows } = await admin
    .from("points_log")
    .select("puntos, motivo")
    .eq("user_id", userId)
    .in("motivo", ["leccion_completada", "evaluacion_aprobada", "certificado_emitido"])
    .order("created_at", { ascending: false })
    .limit(3);
  const motivos = (pointsRows ?? []).map((r) => r.motivo).sort();
  expect(motivos).toEqual(["certificado_emitido", "evaluacion_aprobada", "leccion_completada"]);

  // Verificación pública del certificado, sin sesión (misma pestaña, logout primero).
  await page.context().clearCookies();
  await page.goto(`/verificar/${certificate!.uuid_verificacion}`);
  await expect(page.getByText("QA Camino Crítico")).toBeVisible();
});
