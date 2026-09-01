# Session Handoff — 2026-09-01 (compra + suscripción de cursos, Etapa 3 — CERRADA CON TAREA PENDIENTE)

## MODO: FREEZE

**El usuario pidió explícitamente frenar acá: "una vez hecho la migración
continuamos recién."** `/continuar` NO debe arrancar ninguna feature nueva
(tutorías add-on, nurturing, etc.) hasta que la tarea de la sección
siguiente esté DONE y confirmada. Si el usuario dice "Retomamos" sin más
contexto, la ÚNICA tarea AUTO disponible es completar la migración — no
inventar otro trabajo mientras tanto.

## TAREA PENDIENTE BLOQUEANTE (hacer esto primero al retomar)

1. **`supabase/migrations/034_coupon_redeem_atomic.sql` tiene un fix sin
   commitear** (`git diff` lo muestra: agrega `drop function if exists
   public.increment_coupon_usage(uuid);` antes del `create or replace`).
   Bug real encontrado hoy al aplicar contra producción por primera vez:
   `increment_coupon_usage()` cambia de `returns void` (migración 030) a
   `returns boolean` (034) — Postgres no permite cambiar el tipo de retorno
   con `create or replace`, tira `SQLSTATE 42P13`. Esta migración nunca se
   había aplicado contra ninguna DB antes de hoy, por eso el bug no se había
   detectado. **Preguntar al usuario si aprueba commitear este fix** (no se
   commiteó todavía, política del proyecto — nunca commitear sin
   aprobación explícita).
2. Con el fix commiteado (o confirmado que ya estaba bien), correr
   `supabase db push --yes` de nuevo. **Ojo:** el classifier de Auto mode
   bloqueó este comando de forma inconsistente esta sesión — la primera vez
   lo bloqueó, tras un "reintenta" del usuario pasó y aplicó 031-033 antes
   de cortarse en el bug de 034, y los 2 reintentos posteriores (ya con el
   fix puesto) volvieron a bloquearse sin patrón claro. Si vuelve a pasar,
   ofrecer al usuario correrlo él mismo en su terminal, o ajustar
   `.claude/settings.json` con la skill `update-config` para permitir este
   patrón de comando.
3. **Estado real de migraciones contra producción confirmado hoy** (`supabase
   migration list`): 001-030 aplicadas desde hace tiempo. **031
   (`rls_hardening`), 032 (`bookings_update_guard`), 033
   (`storage_coordinador_rls`) se aplicaron recién HOY, exitosamente** (dos
   NOTICE inofensivos sobre triggers que no existían para dropear, nada
   bloqueante). **034, 035, 036 siguen sin aplicar** — 034 por el bug de
   arriba, 035/036 nunca llegaron a intentarse porque el push se corta en el
   primer error.
4. Una vez que 034+035+036 apliquen limpio: verificar funcionalmente
   contra la DB real (script tipo `verify-fase3-tmp.js`) el flujo completo
   de compra individual de curso Y de suscripción mensual, antes de avisar
   que Etapa 3 (esta porción) está lista para pruebas.

## ESTADO ACTUAL
- Rama activa: `fix/db-search-path-024`
- Último commit: `0fd2f40` (pusheado — `origin/fix/db-search-path-024` en sync, salvo el fix de 034 sin commitear del punto 1).
- PR #1: OPEN, MERGEABLE.

## TRABAJO DE ESTA SESIÓN — dos entregables de Etapa 3
1. **Compra individual de cursos vía MercadoPago** (`f10c650`/`4ec9246`,
   pusheados): migración `035_compras_curso.sql` (tabla + función
   `promote_lead_on_course_payment()` SECURITY DEFINER para CU-T03),
   `createCoursePreference()`, `purchaseCourseAction`, branch nuevo en el
   webhook (prefijo `curso:`), `CoursePurchaseForm.tsx`, routing pago/gratis
   en `cursos/[slug]/page.tsx`, página de estado
   `cursos/[slug]/compra/[compraId]/page.tsx`.
2. **Suscripción mensual al catálogo educativo** (`0fd2f40`, pusheado):
   migración `036_catalogo_suscripciones.sql` (tablas + función
   `has_active_course_subscription()`), reusa el mecanismo de membresías de
   Coworking (`createCourseSubscription()`, PreApproval de MP) sin tocar el
   código existente de Coworking, acceso vía inscripción perezosa a
   `enrollments` (`enrollViaSubscriptionAction`), admin en
   `/admin/suscripciones`, picker público en `/cursos/suscripcion`.

Ambos con plan completo aprobado en modo plan (ver
`C:\Users\Usuario\.claude\plans\partitioned-cooking-goose.md`, sobrescrito
entre los dos — si hace falta el detalle del primero, está en el historial
de este chat). Nurturing y tutorías-add-on quedan **fuera de alcance a
propósito** — nurturing reutilizaría Resend (sin herramienta nueva) pero
falta el copy; tutorías-add-on ya tiene mecánica decidida por el usuario
(precio fijo por curso) pero es una feature separada, no arrancada.

**DoD verde en ambos commits:** `tsc`/`lint`/`test:unit`/`build` los 4 en
verde (el primer build tuvo que limpiar un `.next/` corrupto de una sesión
anterior).

## RESULTADO DE LOS 4 GATES (verificado local, esta sesión, sobre HEAD `0fd2f40`)
- `npx tsc --noEmit` → OK, sin errores
- `npm run lint` → OK, 0 errores (1 warning preexistente `jsx-a11y/alt-text` en `src/lib/certificatePdf.tsx`, no bloqueante)
- `npm run test:unit` → OK, 17/17 passed (3 archivos)
- `npm run build` → OK, exit 0, 64 rutas incluidas las 4 nuevas de suscripción (`/admin/suscripciones`, `/cursos/suscripcion`, `/cursos/suscripcion/[planId]`, `/cursos/suscripcion/estado/[suscripcionId]`).

## HALLAZGO DE ESTA SESIÓN — T4 (Vercel) deja de estar BLOCKED
El deploy de Vercel **existe y funciona de verdad** (status check `Vercel` = SUCCESS en el PR, con URL real). Las sesiones anteriores (desde 2026-08-12) no podían confirmarlo porque el MCP de Vercel veía 0 proyectos en el team conectado — eso era un problema de visibilidad del MCP, no de que faltara el deploy. Detalle actualizado en `resolver_loop1.md` T4 (bajado de BLOCKED a PARCIAL). Sigue sin confirmar: dominio custom `incadeducativa.com` y envs cargados por ambiente — la CLI de Vercel local sigue sin instalar.

## MODO: NORMAL
Cola al día, gates verdes, sin código pendiente de commitear (0 ahead/0 behind). T4 avanzó de estado (ver arriba), T8 también (ver `resolver_loop1.md`: de 6 variables faltantes a solo `CRON_SECRET`). El bloque grande que falta para el 100% del sistema es Etapa 3 (pago de cursos vía MercadoPago, suscripciones, nurturing automatizado) — ver `docs/FUNCIONALIDADES.md`, la mayoría de esos ítems siguen en `[ ]`.

## PRÓXIMA TAREA SUGERIDA (vía /continuar)
1. Con el usuario: confirmar si instala la CLI de Vercel (`npm i -g vercel`) para poder verificar dominio/envs por ambiente sin depender del dashboard manual.
2. Retomar T6 (rotar service role key) y T7 (Supabase staging, 34 migraciones a replicar) — ambos siguen 100% manuales/BLOCKED.
3. Si el usuario quiere seguir hacia el 100%: planificar Etapa 3 completa (pagos de cursos individuales vía MP — 8 ítems del checklist en `[ ]` —, suscripciones, nurturing días 1/3/7), es lo más grande que falta.
4. Si se quiere `e2e` verde en CI: cargar los secrets de Supabase que necesita el `webServer` de Playwright como Secrets del repo en GitHub.

## PENDIENTES SIN RESOLVER (arrastrados)
- `verify-fase3-tmp.js` sin trackear en la raíz del repo — script temporal de verificación, deliberadamente sin commitear (se autodeclara "no se commitea" en su propio header)
- Archivos demo del wizard de Sentry (`sentry-example-api`, `sentry-example-page`, `global-error.tsx`) sin limpiar antes de producción real — no se tocaron esta sesión
- Comentario desactualizado en `src/app/(dashboard)/layout.tsx:143-145` ("la única rama que llega hasta acá es /carreras") — cosmético, actualizar cuando se toque ese archivo de nuevo
- `docs/FUNCIONALIDADES.md:462` sigue describiendo el deploy de Vercel como "BLOCKED-ESPERANDO-HUMANO, sin proyecto vinculado" — quedó obsoleto por el hallazgo de esta sesión, no se corrigió todavía (fuera del alcance de `/poner-a-punto`, que solo toca `resolver_loop1.md`/`session_handoff.md`)

## RESUELTO DESDE EL HANDOFF ANTERIOR
- Los 10 hallazgos de `INFORME_CODE_REVIEW_2026-08-29.md` (informe ya borrado tras resolverse, por decisión del usuario) están commiteados y pusheados en `f9f10d5`.
- El fix de middleware que bloqueaba manifest/sw/icons para visitantes sin sesión (T9) está commiteado y pusheado en `8fbaa04`.

## Handoffs anteriores

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
