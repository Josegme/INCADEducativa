import { test, expect } from "@playwright/test";
import { createAdminTestClient } from "./supabaseTestClient";

/**
 * FUNCIONALIDADES.md §9.1 — "E2E Etapa 2 (Playwright): reserva coworking →
 * pago → lista del día → check-in manual → no-show". Contraparte de Etapa 1
 * (critical-path.spec.ts), mismo criterio de alcance: un solo camino
 * crítico de punta a punta.
 *
 * Fixture: sede + 2 espacios (uno para el flujo de reserva/check-in, otro
 * para el fixture de no-show, así no compiten por el mismo horario contra
 * la exclusion constraint `no_overlap` de `bookings`) creados y borrados en
 * cada corrida. Dos cuentas QA fijas reutilizables entre corridas (mismo
 * criterio que `qa.e2e.criticalpath@...`: no se pueden borrar del todo por
 * el ledger append-only de puntos/auditoría, quedan como cuentas
 * descartables permanentes).
 *
 * No hay MP_ACCESS_TOKEN configurada en este entorno (ni sandbox de
 * MercadoPago en el proyecto — nunca se corrió el webhook con token real).
 * `createBookingAction` ya degrada con gracia a este caso (ver
 * BookingConfirmationPage: "Pago no disponible en este entorno de
 * desarrollo"), así que el test no fuerza nada ahí. Para simular "pago
 * aprobado" se replican exactamente las mismas escrituras que hace
 * `src/app/api/mercadopago/webhook/route.ts` al aprobar un pago
 * (`payments.estado='aprobado'` + `bookings.estado='confirmada'`) — mismo
 * bypass que ya usa `createManualBookingAction` del propio admin.
 */

const ALUMNO_EMAIL = "qa.e2e.coworking.alumno@incadeducativa.com";
const ALUMNO_PASSWORD = "Test1234!QA";
const ADMIN_EMAIL = "qa.e2e.coworking.admin@incadeducativa.com";
const ADMIN_PASSWORD = "Test1234!QA";

let admin: ReturnType<typeof createAdminTestClient>;
let alumnoId: string;
let locationId: string;
let spaceId: string;
let spaceNoShowId: string;

async function ensureQaUser(email: string, password: string, role: "alumno" | "admin", nombre: string) {
  const { data: existing } = await admin.from("users").select("id").eq("email", email).maybeSingle();

  let id: string;
  if (existing) {
    id = existing.id as string;
  } else {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr || !created.user) throw new Error(`No se pudo crear ${email}: ${createErr?.message}`);
    id = created.user.id;

    const { error: profileErr } = await admin
      .from("users")
      .insert({ id, email, nombre, apellido: "E2E", role });
    if (profileErr) throw new Error(`No se pudo crear el perfil de ${email}: ${profileErr.message}`);
  }

  await admin.from("users").update({ role }).eq("id", id);
  return id;
}

test.beforeAll(async () => {
  admin = createAdminTestClient();

  alumnoId = await ensureQaUser(ALUMNO_EMAIL, ALUMNO_PASSWORD, "alumno", "QA Coworking Alumno");
  await ensureQaUser(ADMIN_EMAIL, ADMIN_PASSWORD, "admin", "QA Coworking Admin");

  // Fixture de sede/espacios — nuevos en cada corrida, se borran en afterAll
  // (cascade real de la 002: locations → spaces → bookings → payments/checkins).
  const { data: location, error: locationErr } = await admin
    .from("locations")
    .insert({ nombre: `QA Coworking ${Date.now()}`, direccion: "Fixture E2E, no es una sede real" })
    .select("id")
    .single();
  if (locationErr || !location) throw new Error(`No se pudo crear la sede fixture: ${locationErr?.message}`);
  locationId = location.id as string;

  const { data: spaces, error: spacesErr } = await admin
    .from("spaces")
    .insert([
      { location_id: locationId, nombre: "QA Coworking Reserva", tipo: "hot_desk", capacidad: 1, precio_hora: 1000 },
      { location_id: locationId, nombre: "QA Coworking NoShow", tipo: "hot_desk", capacidad: 1, precio_hora: 1000 },
    ])
    .select("id");
  if (spacesErr || !spaces || spaces.length !== 2) throw new Error(`No se pudieron crear los espacios fixture: ${spacesErr?.message}`);
  spaceId = spaces[0].id as string;
  spaceNoShowId = spaces[1].id as string;
});

test.afterAll(async () => {
  // Borrar la sede cascadea espacios/reservas/pagos/checkins fixture.
  await admin.from("locations").delete().eq("id", locationId);
});

test("camino crítico coworking: reserva → pago → lista del día → check-in → no-show", async ({ page }) => {
  // 1-2. Reserva por UI real, como alumno.
  await page.goto("/login");
  await page.getByLabel("Email").fill(ALUMNO_EMAIL);
  await page.getByLabel("Contraseña").fill(ALUMNO_PASSWORD);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto(`/servicios/coworking/reservar/${spaceId}`);
  await page.getByRole("button", { name: "10:00" }).click();
  await page.getByRole("button", { name: "Reservar y pagar" }).click();

  // Sin MP_ACCESS_TOKEN configurada, createBookingAction degrada a "pendiente"
  // sin ir a MercadoPago (ver BookingConfirmationPage).
  await expect(page).toHaveURL(/\/servicios\/coworking\/reservas\//);
  await expect(page.getByText("Pago no disponible en este entorno de desarrollo")).toBeVisible();
  await expect(page.getByText("Pendiente de pago")).toBeVisible();

  const bookingId = page.url().split("/").pop()!;
  const { data: bookingRow } = await admin.from("bookings").select("estado").eq("id", bookingId).single();
  expect(bookingRow?.estado).toBe("pendiente");

  // 3. "Pago aprobado" — misma escritura que hace el webhook de MP al aprobar.
  await admin
    .from("payments")
    .update({ estado: "aprobado", mp_payment_id: `qa-e2e-coworking-${Date.now()}` })
    .eq("booking_id", bookingId);
  await admin.from("bookings").update({ estado: "confirmada" }).eq("id", bookingId).eq("estado", "pendiente");

  const { data: confirmedBooking } = await admin.from("bookings").select("estado").eq("id", bookingId).single();
  expect(confirmedBooking?.estado).toBe("confirmada");

  // 4. Lista del día del admin — la reserva de hoy tiene que aparecer confirmada.
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Contraseña").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/admin/coworking/reservas");
  const row = page.getByRole("row").filter({ hasText: "QA Coworking Reserva" });
  await expect(row).toBeVisible();
  await expect(row.getByText("Confirmada")).toBeVisible();

  // 5. Check-in manual ("Presente").
  await row.getByRole("button", { name: "Presente" }).click();
  await expect(row.getByText("En uso")).toBeVisible();

  const { data: checkedInBooking } = await admin.from("bookings").select("estado").eq("id", bookingId).single();
  expect(checkedInBooking?.estado).toBe("en_uso");
  const { data: checkins } = await admin.from("checkins").select("metodo").eq("booking_id", bookingId);
  expect(checkins?.[0]?.metodo).toBe("manual");

  // 6. No-show — reserva fixture con fecha_inicio ya pasada (no se puede
  // generar por UI: el form solo ofrece horarios futuros), y misma RPC que
  // usa el cron / el botón "Actualizar estados ahora" de /admin/coworking/ocupacion.
  const fechaInicioPasada = new Date(Date.now() - 20 * 60 * 1000);
  const fechaFinPasada = new Date(fechaInicioPasada.getTime() + 60 * 60 * 1000);

  const { data: noShowBooking, error: noShowBookingErr } = await admin
    .from("bookings")
    .insert({
      user_id: alumnoId,
      space_id: spaceNoShowId,
      fecha_inicio: fechaInicioPasada.toISOString(),
      fecha_fin: fechaFinPasada.toISOString(),
      estado: "confirmada",
      monto: 1000,
      descuento_pct: 0,
      tipo_descuento: "manual",
    })
    .select("id")
    .single();
  if (noShowBookingErr || !noShowBooking) throw new Error(`No se pudo crear la reserva fixture de no-show: ${noShowBookingErr?.message}`);
  await admin.from("payments").insert({
    booking_id: noShowBooking.id,
    monto: 1000,
    estado: "aprobado",
    mp_payment_id: `qa-e2e-coworking-noshow-${Date.now()}`,
  });

  const { error: detectErr } = await admin.rpc("detect_no_shows");
  expect(detectErr).toBeNull();

  const { data: noShowResult } = await admin.from("bookings").select("estado").eq("id", noShowBooking.id).single();
  expect(noShowResult?.estado).toBe("no_show");

  // Filtro "todas las fechas": la reserva fixture es de hace 20 min, que
  // puede caer en el día calendario ANTERIOR si la corrida pasa cerca de
  // medianoche — el filtro por defecto de la página es "solo hoy".
  await page.goto("/admin/coworking/reservas?fecha=todas");
  const noShowRow = page.getByRole("row").filter({ hasText: "QA Coworking NoShow" });
  await expect(noShowRow.getByText("No se presentó")).toBeVisible();
});
