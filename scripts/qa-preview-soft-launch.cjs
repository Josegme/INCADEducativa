/**
 * QA soft-launch + Lighthouse + E3 flag toggle against a protected Vercel deploy.
 * Uses VERCEL_OIDC_TOKEN from .env.local (vercel link / env pull).
 *
 * Usage:
 *   node scripts/qa-preview-soft-launch.mjs
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

require("dotenv").config({ path: ".env.local" });

// Prefer Preview (OIDC Trusted Sources works for preview by default;
  // Production needs an extra Trusted Sources rule).
const BASE =
  process.env.QA_BASE_URL ||
  "https://incadeducativa-abgu37vcd-josegmescobar-2036s-projects.vercel.app";
const OIDC = process.env.VERCEL_OIDC_TOKEN;
const PASS = "Test1234!QA";

const USERS = {
  admin: "qa.e2e.coworking.admin@incadeducativa.com",
  alumno: "qa.e2e.coworking.alumno@incadeducativa.com",
  docente: "docente.test@incadeducativa.com",
};

const LH_PAGES = [
  { path: "/", slug: "home" },
  { path: "/login", slug: "login" },
  { path: "/carreras", slug: "carreras" },
  { path: "/design-preview", slug: "design-preview" },
  { path: "/servicios/coworking", slug: "coworking" },
];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function login(page, email) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña").fill(PASS);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 45000 });
}

async function main() {
  assert(OIDC, "Missing VERCEL_OIDC_TOKEN — run vercel link / vercel env pull");

  const outDir = path.join("docs", "qa", "lighthouse");
  fs.mkdirSync(outDir, { recursive: true });

  const results = {
    base: BASE,
    date: new Date().toISOString().slice(0, 10),
    publicRoutes: {},
    logins: {},
    pwa: {},
    lighthouse: {},
    e3: {},
    errors: [],
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    extraHTTPHeaders: {
      "x-vercel-trusted-oidc-idp-token": OIDC,
    },
  });
  const page = await context.newPage();

  try {
    // Public / PWA
    for (const p of ["/", "/login", "/carreras", "/manifest.json", "/servicios/coworking"]) {
      const res = await page.goto(`${BASE}${p}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      const html = await page.content();
      const sso = /Log in to Vercel|vercel.com\/login/i.test(html);
      const status = res?.status() ?? 0;
      const ok =
        !sso &&
        status !== 401 &&
        status !== 403 &&
        (res?.ok() || status === 307 || status === 308);
      results.publicRoutes[p] = { status, sso, ok };
      assert(!sso, `SSO still blocking ${p}`);
      assert(ok, `Protected deploy returned ${status} for ${p} (check OIDC / Preview URL)`);
    }
    results.pwa.manifest = results.publicRoutes["/manifest.json"]?.ok === true;

    // Logins
    for (const [role, email] of Object.entries(USERS)) {
      try {
        await context.clearCookies();
        await login(page, email);
        results.logins[role] = { email, ok: true, url: page.url() };
        if (role === "docente") {
          await page.goto(`${BASE}/docente`, { waitUntil: "domcontentloaded", timeout: 60000 });
          results.logins.docenteHome = { ok: true, url: page.url() };
        }
        if (role === "admin") {
          await page.goto(`${BASE}/admin/configuracion`, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          });
          results.logins.adminConfig = { ok: !page.url().includes("/login"), url: page.url() };
        }
        if (role === "alumno") {
          await page.goto(`${BASE}/cursos`, { waitUntil: "domcontentloaded", timeout: 60000 });
          results.logins.alumnoCursos = { ok: !page.url().includes("/login"), url: page.url() };
        }
      } catch (e) {
        results.logins[role] = { email, ok: false, error: String(e.message || e) };
        results.errors.push(`${role}: ${e.message || e}`);
      }
    }

    // E3: toggle publica via admin UI if possible
    try {
      await context.clearCookies();
      await login(page, USERS.admin);
      await page.goto(`${BASE}/admin/configuracion`, {
        waitUntil: "networkidle",
        timeout: 60000,
      });
      const publicaToggle = page
        .locator("text=/apertura pública|publica|FEATURE_PUBLICA/i")
        .first();
      const hasToggle = (await publicaToggle.count()) > 0;
      results.e3.configPage = { ok: true, hasToggle, url: page.url() };

      // Verify /registro gate while publica should be off (soft launch)
      await context.clearCookies();
      const reg = await page.goto(`${BASE}/registro`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      results.e3.registroWithPublicaOff = {
        status: reg?.status() ?? 0,
        url: page.url(),
        redirectedToLogin: page.url().includes("/login"),
      };
    } catch (e) {
      results.e3.error = String(e.message || e);
      results.errors.push(`e3: ${e.message || e}`);
    }

    // Lighthouse (skip if SKIP_LH=1 — scores already captured)
    if (process.env.SKIP_LH === "1") {
      results.lighthouse.skipped = true;
    } else {
    try {
      const lighthouseMod = require("lighthouse");
      const lighthouse = lighthouseMod.default || lighthouseMod;
      const chromeLauncher = require("chrome-launcher");
      const chrome = await chromeLauncher.launch({
        chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
      });
      for (const { path: p, slug } of LH_PAGES) {
        const runnerResult = await lighthouse(`${BASE}${p}`, {
          port: chrome.port,
          output: "json",
          onlyCategories: ["performance", "accessibility"],
          formFactor: "mobile",
          screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75 },
          extraHeaders: { "x-vercel-trusted-oidc-idp-token": OIDC },
        });
        const report = runnerResult.lhr;
        const outPath = path.join(outDir, `lh-${slug}.json`);
        fs.writeFileSync(outPath, runnerResult.report);
        const cats = report.categories || {};
        const audits = report.audits || {};
        results.lighthouse[slug] = {
          path: p,
          perf: Math.round((cats.performance?.score ?? 0) * 100),
          a11y: Math.round((cats.accessibility?.score ?? 0) * 100),
          lcp: audits["largest-contentful-paint"]?.displayValue ?? "—",
          cls: audits["cumulative-layout-shift"]?.displayValue ?? "—",
          inp:
            audits["interaction-to-next-paint"]?.displayValue ||
            audits["experimental-interaction-to-next-paint"]?.displayValue ||
            "—",
          runtimeError: report.runtimeError?.code || null,
          finalUrl: report.finalUrl,
        };
      }
      await chrome.kill();
    } catch (e) {
      results.errors.push(`lighthouse: ${e.message || e}`);
    }
    }
  } finally {
    await browser.close();
  }

  const reportPath = path.join("docs", "qa", "preview-qa-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  console.log(`\nWrote ${reportPath}`);
  if (results.errors.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
