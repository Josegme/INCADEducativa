# Session Handoff — 2026-09-01 (compra de cursos, Etapa 3)

## ESTADO ACTUAL
- Rama activa: `fix/db-search-path-024`
- Último commit: `f10c650` — **commiteado, NO pusheado todavía** (esperando indicación explícita del usuario).
- PR #1: OPEN, MERGEABLE (estado de CI sobre `c379e7e` sigue siendo el último confirmado en Actions — `f10c650` no se pusheó, así que no disparó un run nuevo).

## TRABAJO DE ESTA SESIÓN — primer entregable de Etapa 3
Implementado (vía /continuar → plan mode → aprobación explícita → commit
aprobado) el flujo completo de **compra individual de cursos vía
MercadoPago**: migración `035_compras_curso.sql` (tabla + función
`promote_lead_on_course_payment()` SECURITY DEFINER para CU-T03, sin
aplicar contra ninguna DB), `createCoursePreference()`, server action
`purchaseCourseAction`, branch nuevo en el webhook de MP (prefijo
`curso:` en `external_reference`, sin tocar el flujo de bookings),
`CoursePurchaseForm.tsx`, routing pago/gratis en
`cursos/[slug]/page.tsx`, página de estado
`cursos/[slug]/compra/[compraId]/page.tsx`. Plan completo en
`C:\Users\Usuario\.claude\plans\partitioned-cooking-goose.md`.
Suscripciones y nurturing quedan **fuera de alcance a propósito** — sin
pricing/tiers decididos en el spec, requieren su propio plan.

**DoD verde:** `tsc`/`lint`/`test:unit`/`build` los 4 en verde sobre este
commit (build tuvo que limpiar `.next/` corrupto de una sesión anterior
primero — mismo síntoma ya documentado, no relacionado a este código).

**Sin verificar todavía:** flujo end-to-end contra una DB real (la
migración 035 no está aplicada), ni un pago real de MercadoPago.

## RESULTADO DE LOS 4 GATES (verificado local, esta sesión, sobre HEAD `f10c650`)
- `npx tsc --noEmit` → OK, sin errores
- `npm run lint` → OK, 0 errores (1 warning preexistente `jsx-a11y/alt-text` en `src/lib/certificatePdf.tsx`, no bloqueante)
- `npm run test:unit` → OK, 17/17 passed (3 archivos)
- `npm run build` → OK, exit 0, 60 rutas incluida `/cursos/[slug]/compra/[compraId]` nueva.

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
