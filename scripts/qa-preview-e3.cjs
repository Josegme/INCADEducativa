/**
 * Soft-launch login smoke + E3 publica toggle on Preview (OIDC).
 * SKIP_LH=1 by design — Lighthouse already archived.
 */
const fs = require("fs");
const { chromium } = require("playwright");
require("dotenv").config({ path: ".env.local" });

const BASE =
  process.env.QA_BASE_URL ||
  "https://incadeducativa-abgu37vcd-josegmescobar-2036s-projects.vercel.app";
const OIDC = process.env.VERCEL_OIDC_TOKEN;
const PASS = "Test1234!QA";

async function login(page, email) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña").fill(PASS);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 45000 });
}

async function main() {
  if (!OIDC) throw new Error("Missing VERCEL_OIDC_TOKEN");
  const out = { base: BASE, date: new Date().toISOString(), steps: {} };
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    extraHTTPHeaders: { "x-vercel-trusted-oidc-idp-token": OIDC },
  });
  const page = await context.newPage();

  try {
    // Soft-launch: admin + alumno
    await login(page, "qa.e2e.coworking.admin@incadeducativa.com");
    out.steps.adminLogin = { ok: true, url: page.url() };
    await page.goto(`${BASE}/admin/configuracion`, { waitUntil: "networkidle", timeout: 60000 });
    out.steps.adminConfig = { ok: page.url().includes("/admin/configuracion") };

    // E3: Activar Catálogo público
    const row = page.locator("div").filter({ hasText: /^Catálogo público/ }).first();
    await page.getByText("Catálogo público", { exact: true }).locator("..").locator("..").getByRole("button", { name: /Activar|Desactivar/ }).click();
    await page.waitForTimeout(2500);
    await page.goto(`${BASE}/admin/configuracion`, { waitUntil: "domcontentloaded", timeout: 60000 });
    const activaBadge = await page
      .locator("div")
      .filter({ hasText: "Catálogo público" })
      .filter({ hasText: "Activo" })
      .count();
    out.steps.publicaOn = { ok: activaBadge > 0 };

    await context.clearCookies();
    await page.goto(`${BASE}/registro`, { waitUntil: "domcontentloaded", timeout: 60000 });
    out.steps.registroWithPublicaOn = {
      url: page.url(),
      showsForm: page.url().includes("/registro") && (await page.getByRole("heading", { name: /Creá tu cuenta/i }).count()) > 0,
    };

    await page.goto(`${BASE}/cursos`, { waitUntil: "domcontentloaded", timeout: 60000 });
    out.steps.cursosPublic = { url: page.url(), statusOk: true };

    // Apagar publica
    await context.clearCookies();
    await login(page, "qa.e2e.coworking.admin@incadeducativa.com");
    await page.goto(`${BASE}/admin/configuracion`, { waitUntil: "networkidle", timeout: 60000 });
    await page.getByText("Catálogo público", { exact: true }).locator("..").locator("..").getByRole("button", { name: /Desactivar|Activar/ }).click();
    await page.waitForTimeout(2500);
    await page.goto(`${BASE}/admin/configuracion`, { waitUntil: "domcontentloaded", timeout: 60000 });
    const inactiva = await page
      .locator("div")
      .filter({ hasText: "Catálogo público" })
      .filter({ hasText: "Inactivo" })
      .count();
    out.steps.publicaOff = { ok: inactiva > 0 };

    await context.clearCookies();
    await page.goto(`${BASE}/registro`, { waitUntil: "domcontentloaded", timeout: 60000 });
    out.steps.registroWithPublicaOff = {
      url: page.url(),
      redirectedToLogin: page.url().includes("/login"),
    };

    // Alumno smoke
    await context.clearCookies();
    await login(page, "qa.e2e.coworking.alumno@incadeducativa.com");
    await page.goto(`${BASE}/cursos`, { waitUntil: "domcontentloaded", timeout: 60000 });
    out.steps.alumnoCursos = { ok: !page.url().includes("/login"), url: page.url() };
    const enroll = page.getByRole("button", { name: /Inscribirme gratis/i });
    if ((await enroll.count()) > 0) {
      await enroll.first().click();
      await page.waitForTimeout(2000);
      out.steps.alumnoEnroll = { attempted: true, url: page.url() };
    } else {
      out.steps.alumnoEnroll = { attempted: false, note: "no free enroll CTA visible" };
    }
  } catch (e) {
    out.error = String(e.message || e);
  } finally {
    await browser.close();
  }

  fs.writeFileSync("docs/qa/preview-qa-e3-report.json", JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  if (out.error || out.steps.publicaOff?.ok === false) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
