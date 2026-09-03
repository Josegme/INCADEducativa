# Session Handoff — 2026-09-03 (puesta a punto tras /recap — MODO FREEZE sigue vigente)

## MODO: FREEZE

La tarea bloqueante sigue siendo aplicar las migraciones 034+035+036
contra producción. `/continuar` NO debe arrancar ninguna feature nueva
(tutorías add-on, nurturing, etc.) hasta que esa tarea esté DONE y
confirmada. Si el usuario dice "Retomamos" sin más contexto, la ÚNICA
tarea AUTO disponible es completar esa migración.

## TAREA PENDIENTE BLOQUEANTE (hacer esto primero al retomar)

1. **Corrección sobre el handoff anterior:** el fix de
   `034_coupon_redeem_atomic.sql` (agrega
   `drop function if exists public.increment_coupon_usage(uuid);` antes
   del `create or replace`, por el cambio de tipo de retorno void→boolean
   que Postgres no permite vía `create or replace`, SQLSTATE 42P13)
   **ya está commiteado** (`18e1414`), incluso antes del commit que
   registró esta cola como FREEZE (`7992b22`). El handoff anterior decía
   "sin commitear" — era un error de redacción del momento, no un
   estado real pendiente. No hace falta volver a pedir aprobación para
   ese commit puntual.
2. Lo que sigue pendiente de verdad: correr `supabase db push --yes`
   contra producción para aplicar 034/035/036. **Ojo:** el classifier de
   Auto mode bloqueó este comando de forma inconsistente en la sesión
   anterior (primera vez bloqueado, con "reintentá" pasó y aplicó
   031-033, dos reintentos posteriores volvieron a bloquearse sin patrón
   claro). Si vuelve a pasar: ofrecer al usuario correrlo él mismo en su
   terminal, o ajustar `.claude/settings.json` con la skill
   `update-config` para permitir el patrón.
3. **Estado real de migraciones contra producción, confirmado el
   2026-09-02 con `supabase migration list`** (CLI logueada, proyecto
   `INCADEducativa` linkeado): 001-033 aplicadas (columna Remote = Local
   en las 33). **034, 035, 036 siguen sin aplicar** (columna Remote
   vacía) — sin cambios desde la sesión anterior.
4. Una vez que 034+035+036 apliquen limpio: verificar funcionalmente
   contra la DB real (script tipo `verify-fase3-tmp.js`) el flujo
   completo de compra individual de curso Y de suscripción mensual,
   antes de avisar que Etapa 3 (esta porción) está lista para pruebas.

## ESTADO ACTUAL (verificado 2026-09-02 vía /recap)
- Rama activa: `fix/db-search-path-024`
- Último commit: `7992b22` (pusheado — `origin/fix/db-search-path-024` en
  sync, 0 ahead / 0 behind confirmado con `git log @{u}..`).
- PR #1: OPEN. `gh pr view` reportó `mergeable: UNKNOWN` en esta corrida
  — no se puede afirmar "MERGEABLE" en tono categórico como decían
  handoffs anteriores sin volver a consultar (GitHub a veces tarda en
  recalcular ese campo tras un push, no implica conflicto confirmado).

## RESULTADO DE LOS GATES DE CI (verificado 2026-09-02, sobre HEAD `7992b22`)
- `npx tsc --noEmit` → OK, sin errores
- `npm run lint` → OK, 0 errores (1 warning preexistente
  `jsx-a11y/alt-text` en `src/lib/certificatePdf.tsx`, no bloqueante)
- `npm run test:unit` → OK, 17/17 passed (3 archivos)
- GitHub Actions, run `33523997424` (2026-09-01T15:10 UTC): job
  `quality` → SUCCESS. Job `e2e` → FAILURE, pero tiene
  `continue-on-error: true` en `ci.yml`, no bloquea el gate real.
- `npm run build` no se corrió en esta pasada (no pedido explícitamente
  por el usuario).

## CORRECCIÓN — T8 (env vars productivas) tenía un error de interpretación
El handoff del 2026-09-01 decía que solo faltaba `CRON_SECRET` y que las
otras 6 (`ANTHROPIC_API_KEY`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`,
`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`) ya
tenían valor cargado localmente. Eso salió de correr el `comm` de
`/recap` en la dirección que trae el propio comando del skill, que
calcula lo inverso de lo que describe. Corriendo la dirección correcta
el 2026-09-02: esas 6 variables **siguen sin valor** en `.env.local`.
Solo `CRON_SECRET` tiene valor local, pero no está declarada en
`.env.example` (caso distinto, no es lo que T8 mide). Detalle completo
en `resolver_loop1.md` T8.

## PRÓXIMA TAREA SUGERIDA (vía /continuar)
1. Correr `supabase db push --yes` para aplicar 034/035/036 (requiere
   aprobación del usuario por tratarse de producción).
2. Verificación funcional del flujo de compra/suscripción de cursos
   post-aplicación.
3. Recién después, T6 (rotar service role key) y T7 (Supabase staging,
   36 migraciones a replicar, no 34) siguen 100% manuales/BLOCKED.

## PENDIENTES SIN RESOLVER (arrastrados)
- `verify-fase3-tmp.js` sin trackear en la raíz del repo — script
  temporal de verificación, deliberadamente sin commitear (se
  autodeclara "no se commitea" en su propio header)
- Archivos demo del wizard de Sentry (`sentry-example-api`,
  `sentry-example-page`, `global-error.tsx`) sin limpiar antes de
  producción real
- Comentario desactualizado en
  `src/app/(dashboard)/layout.tsx:143-145` ("la única rama que llega
  hasta acá es /carreras") — cosmético, actualizar cuando se toque ese
  archivo de nuevo
- `docs/FUNCIONALIDADES.md:462` sigue describiendo el deploy de Vercel
  como "BLOCKED-ESPERANDO-HUMANO, sin proyecto vinculado" — obsoleto,
  fuera del alcance de `/poner-a-punto` (solo toca
  `resolver_loop1.md`/`session_handoff.md`)

## RESUELTO DESDE EL HANDOFF ANTERIOR
- El fix de `034_coupon_redeem_atomic.sql` (drop antes de recrear
  `increment_coupon_usage`) está commiteado (`18e1414`) — el handoff
  anterior lo daba por pendiente por error de redacción.
- Migraciones 001-033 confirmadas aplicadas en producción vía
  `supabase migration list` (antes solo se sabía por inferencia de
  `session_handoff.md`, ahora verificado con el CLI logueado).

## Handoffs anteriores

### Session Handoff — 2026-09-01 (compra + suscripción de cursos, Etapa 3 — CERRADA CON TAREA PENDIENTE)

#### MODO: FREEZE (según ese momento)
El usuario pidió explícitamente frenar acá: "una vez hecho la migración
continuamos recién." `/continuar` NO debe arrancar ninguna feature nueva
(tutorías add-on, nurturing, etc.) hasta que la tarea de la sección
siguiente esté DONE y confirmada.

#### TAREA PENDIENTE BLOQUEANTE (según ese momento — punto 1 corregido arriba)
1. `supabase/migrations/034_coupon_redeem_atomic.sql` tiene un fix sin
   commitear (`git diff` lo muestra: agrega
   `drop function if exists public.increment_coupon_usage(uuid);` antes
   del `create or replace`). Bug real encontrado al aplicar contra
   producción por primera vez: `increment_coupon_usage()` cambia de
   `returns void` (migración 030) a `returns boolean` (034) — Postgres
   no permite cambiar el tipo de retorno con `create or replace`, tira
   `SQLSTATE 42P13`. **Preguntar al usuario si aprueba commitear este
   fix.**
2. Con el fix commiteado, correr `supabase db push --yes` de nuevo.
3. Estado real de migraciones contra producción confirmado ese día
   (`supabase migration list`): 001-030 aplicadas desde hace tiempo.
   031 (`rls_hardening`), 032 (`bookings_update_guard`), 033
   (`storage_coordinador_rls`) se aplicaron ese mismo día. 034, 035, 036
   seguían sin aplicar.
4. Una vez que 034+035+036 apliquen limpio: verificar funcionalmente
   contra la DB real el flujo completo de compra individual de curso Y
   de suscripción mensual.

#### ESTADO ACTUAL (según ese momento)
- Rama activa: `fix/db-search-path-024`
- Último commit: `0fd2f40` (pusheado — en sync salvo el fix de 034 sin
  commitear del punto 1, que se commiteó después como `18e1414`).
- PR #1: OPEN, MERGEABLE.

#### TRABAJO DE ESA SESIÓN — dos entregables de Etapa 3
1. **Compra individual de cursos vía MercadoPago** (`f10c650`/`4ec9246`):
   migración `035_compras_curso.sql` (tabla + función
   `promote_lead_on_course_payment()` SECURITY DEFINER para CU-T03),
   `createCoursePreference()`, `purchaseCourseAction`, branch nuevo en
   el webhook (prefijo `curso:`), `CoursePurchaseForm.tsx`, routing
   pago/gratis en `cursos/[slug]/page.tsx`, página de estado
   `cursos/[slug]/compra/[compraId]/page.tsx`.
2. **Suscripción mensual al catálogo educativo** (`0fd2f40`): migración
   `036_catalogo_suscripciones.sql` (tablas + función
   `has_active_course_subscription()`), reusa el mecanismo de
   membresías de Coworking (`createCourseSubscription()`, PreApproval de
   MP) sin tocar el código existente de Coworking, acceso vía
   inscripción perezosa a `enrollments` (`enrollViaSubscriptionAction`),
   admin en `/admin/suscripciones`, picker público en
   `/cursos/suscripcion`.

Nurturing y tutorías-add-on quedaron fuera de alcance a propósito.

#### RESULTADO DE LOS 4 GATES (verificado esa sesión, sobre HEAD `0fd2f40`)
- `npx tsc --noEmit` → OK, sin errores
- `npm run lint` → OK, 0 errores (1 warning preexistente
  `jsx-a11y/alt-text`)
- `npm run test:unit` → OK, 17/17 passed (3 archivos)
- `npm run build` → OK, exit 0, 64 rutas incluidas las 4 nuevas de
  suscripción.

#### HALLAZGO DE ESA SESIÓN — T4 (Vercel) deja de estar BLOCKED
El deploy de Vercel existe y funciona de verdad (status check `Vercel` =
SUCCESS en el PR, con URL real). Detalle en `resolver_loop1.md` T4
(bajado de BLOCKED a PARCIAL).

#### MODO: NORMAL (nota: bloque contradictorio dejado tal cual del
original — la sesión pasó a FREEZE después de escribir esto; se
preserva sin editar por fidelidad histórica)
Cola al día, gates verdes, sin código pendiente de commitear. T4 avanzó
de estado, T8 también (de 6 variables faltantes a solo `CRON_SECRET` —
corregido más arriba, esa lectura era errónea). El bloque grande que
falta para el 100% del sistema es Etapa 3, ver `docs/FUNCIONALIDADES.md`.

#### PRÓXIMA TAREA SUGERIDA (según ese momento)
1. Confirmar si se instala la CLI de Vercel.
2. Retomar T6 y T7 — ambos 100% manuales/BLOCKED.
3. Si se quiere seguir hacia el 100%: planificar Etapa 3 completa.
4. Si se quiere `e2e` verde en CI: cargar los secrets de Supabase que
   necesita el `webServer` de Playwright como Secrets del repo.

#### PENDIENTES SIN RESOLVER (arrastrados, según ese momento)
- `verify-fase3-tmp.js` sin trackear
- Archivos demo del wizard de Sentry sin limpiar
- Comentario desactualizado en `src/app/(dashboard)/layout.tsx:143-145`
- `docs/FUNCIONALIDADES.md:462` desactualizado sobre Vercel

#### RESUELTO DESDE EL HANDOFF ANTERIOR (según ese momento)
- Los 10 hallazgos de `INFORME_CODE_REVIEW_2026-08-29.md` commiteados y
  pusheados en `f9f10d5`.
- El fix de middleware que bloqueaba manifest/sw/icons (T9) commiteado
  y pusheado en `8fbaa04`.

### Session Handoff — 2026-09-01 06:10 UTC

#### ESTADO ACTUAL
- Rama activa: `fix/db-search-path-024`
- Último commit: `8fbaa04` (pusheado — `origin/fix/db-search-path-024` en sync, 0 ahead / 0 behind)
- PR #1: OPEN, MERGEABLE. CI sobre `f9f10d5` confirmado: `quality` → pass (41s). `e2e` viene fallando desde antes por gap de secrets de Supabase, no por código.

#### RESULTADO DE LOS 4 GATES (verificado local, esa sesión, sobre HEAD `8fbaa04`)
- `npx tsc --noEmit` → OK, sin errores
- `npm run lint` → OK, 0 errores (1 warning preexistente `jsx-a11y/alt-text` en `src/lib/certificatePdf.tsx`, no bloqueante)
- `npm run test:unit` → OK, 17/17 passed (3 archivos)
- `npm run build` + `npm run start -p 3100` + `curl` anónimo → manifest.json/sw.js/icons pasan de 307→/login a 200 con content-type correcto; `/dashboard` (control) sigue protegido igual que antes.
- CI en GitHub Actions sobre `33279775859`/`33473351021`: `quality` pass, `e2e` fail — falla por falta de secrets de Supabase en el entorno de Actions, no por un bug de código.

#### PENDIENTES SIN RESOLVER (arrastrados)
- `verify-fase3-tmp.js` sin trackear en la raíz del repo — script temporal de verificación, deliberadamente sin commitear
- Archivos demo del wizard de Sentry sin limpiar antes de producción real
- Comentario desactualizado en `src/app/(dashboard)/layout.tsx:143-145`

### Session Handoff — 2026-08-29 13:25 UTC

#### ESTADO ACTUAL
- Rama activa: `fix/db-search-path-024`
- Último commit: `4c1b241` (pusheado — `origin/fix/db-search-path-024` en sync, 0 ahead / 0 behind)
- PR #1: OPEN, MERGEABLE (https://github.com/Josegme/INCADEducativa/pull/1) — los checks de GitHub Actions visibles son del 2026-08-23, **anteriores** a los 7 commits pusheados hoy; falta confirmar `gh pr checks` / `gh run watch` sobre este HEAD antes de darlo por verde en CI real.

#### RESULTADO DE LOS 4 GATES (verificado local, esta sesión, sobre HEAD `4c1b241`)
- `npx tsc --noEmit` → OK, sin errores
- `npm run lint` → OK, 0 errores (1 warning preexistente `jsx-a11y/alt-text` en `src/lib/certificatePdf.tsx`, no bloqueante)
- `npm run test:unit` → OK, 14/14 passed (2 archivos)
- `npx vitest run tests/unit/gradeAttempt.test.ts` → OK, 8/8 passed (incluye fix de expectativa + test nuevo de "marcar todas las opciones", ver commit `02aab85`)

#### MODO: NORMAL
Cola al día, gates verdes, se puede seguir con desarrollo normal desde la cola de `resolver_loop1.md` o con la deuda funcional E1/E2 que ya está en la rama.

#### PRÓXIMA TAREA SUGERIDA
Confirmar CI verde en GitHub Actions para el HEAD `4c1b241` (los 7 commits recién pusheados no tienen check corrido todavía). Luego retomar T6/T7/T8 de `resolver_loop1.md` (gates 100% manuales, requieren al usuario) o seguir con el trabajo de deuda funcional E1/E2 fuera de la cola original (reestructura de `(protected)/`, migraciones 027-031, motor de evaluaciones).

#### PENDIENTES SIN RESOLVER (arrastrados)
- `verify-fase3-tmp.js` sin trackear en la raíz del repo — script temporal de verificación, deliberadamente sin commitear (se autodeclara "no se commitea" en su propio header)
- Archivos demo del wizard de Sentry (`sentry-example-api`, `sentry-example-page`, `global-error.tsx`) sin limpiar antes de producción real — no se tocaron esta sesión

#### RESUELTO DESDE EL HANDOFF ANTERIOR
- `.cursor/mcp.json` ya está gitignorado (`.gitignore:19`, patrón `.cursor/`) — el pendiente de decisión del 2026-08-18 está cerrado
- `.claude/commands/*.md` (los tres slash commands `/recap`, `/poner-a-punto`, `/continuar`) quedaron versionados en el repo (commit `4c1b241`); `.claude/settings.local.json` se excluyó explícitamente vía `.gitignore` por ser config personal

### Session Handoff — 2026-08-18

#### ARCHIVOS TOCADOS EN ESA SESIÓN
(sin commitear al cierre)

- Modificados: `.gitignore` (agregó exclusión de `.env.sentry-build-plugin`), `next.config.mjs`, `package-lock.json`, `package.json`
- Nuevos (Sentry wizard, T5): `sentry.edge.config.ts`, `sentry.server.config.ts`, `src/instrumentation.ts`, `src/instrumentation-client.ts`, `src/app/global-error.tsx`, `src/app/api/sentry-example-api/`, `src/app/sentry-example-page/`
- Nuevo: `docs/addenda/resolver_loop1.md` (arrastrado de sesiones previas, sigue sin trackear)
- Nuevo sin trackear: `.cursor/` — incluía `.cursor/mcp.json`, no estaba en `.gitignore` (arrastrado de la sesión del 2026-08-13) — **resuelto**, ver arriba

#### MIGRACIONES CREADAS PERO NO APLICADAS (en ese momento)
- `024_security_definer_search_path.sql` — commiteada (`4803234`), no aplicada contra ninguna DB (T2 de la cola de `resolver_loop1.md`)

#### BLOQUEANTES ACTIVOS (en ese momento)
- T4 (Vercel): BLOCKED-ESPERANDO-HUMANO según memoria del 2026-08-13
- `.cursor/mcp.json` sin gitignorear, contenido no inspeccionado — **resuelto**, ver arriba
- Archivos demo del wizard de Sentry — siguen sin tocar, ver pendientes arriba
