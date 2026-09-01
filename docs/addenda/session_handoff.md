# Session Handoff — 2026-09-01 05:22 UTC

## ESTADO ACTUAL
- Rama activa: `fix/db-search-path-024`
- Último commit: `f9f10d5` (pusheado — `origin/fix/db-search-path-024` en sync, 0 ahead / 0 behind)
- PR #1: OPEN, MERGEABLE. CI sobre este HEAD (run `33473351021`): `quality` → pass (41s, confirmado en Actions). `e2e` y `Vercel` seguían `pending` al cerrar esta sesión — chequear con `gh pr checks fix/db-search-path-024` para el resultado final; `e2e` es esperable que siga fallando por el gap de secrets de Supabase (ver abajo), no por este commit.

## RESULTADO DE LOS 4 GATES (verificado local, esta sesión, sobre HEAD `f9f10d5`)
- `npx tsc --noEmit` → OK, sin errores
- `npm run lint` → OK, 0 errores (1 warning preexistente `jsx-a11y/alt-text` en `src/lib/certificatePdf.tsx`, no bloqueante)
- `npm run test:unit` → OK, 17/17 passed (3 archivos, incluye `tests/unit/extractManualAnswers.test.ts` nuevo)
- CI en GitHub Actions sobre el run anterior (`33279775859`, HEAD `beac0c6`, 2026-08-29): `quality` pass, `e2e` fail — falla por falta de secrets de Supabase en el entorno de Actions ("Your project's URL and Key are required to create a Supabase client"), no por un bug de código.

## MODO: NORMAL
Cola al día, gates verdes localmente, fix del code review commiteado y pusheado. Falta confirmar CI en Actions sobre este HEAD nuevo (recién disparado). `e2e` sigue rojo por el gap de secrets, arrastrado, no relacionado a este commit.

## PRÓXIMA TAREA SUGERIDA
1. Confirmar en GitHub Actions que `quality` sigue verde sobre `f9f10d5` (run `33473351021`).
2. Si se quiere `e2e` verde en CI: cargar los secrets de Supabase que necesita el `webServer` de Playwright (`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` u otros que arme `.env.local`) como Secrets del repo en GitHub — 100% manual, dashboard de GitHub.
3. Retomar T4/T6/T7/T8 de `resolver_loop1.md` (gates 100% manuales) o seguir con deuda funcional E1/E2 fuera de cola.

## PENDIENTES SIN RESOLVER (arrastrados)
- `verify-fase3-tmp.js` sin trackear en la raíz del repo — script temporal de verificación, deliberadamente sin commitear (se autodeclara "no se commitea" en su propio header)
- Archivos demo del wizard de Sentry (`sentry-example-api`, `sentry-example-page`, `global-error.tsx`) sin limpiar antes de producción real — no se tocaron esta sesión
- Comentario desactualizado en `src/app/(dashboard)/layout.tsx:143-145` ("la única rama que llega hasta acá es /carreras") — quedó obsoleto por el fix del hallazgo #1 del code review (`/cursos` también llega ahí sin sesión ahora, por diseño). No bloqueante, cosmético — actualizar cuando se toque ese archivo de nuevo.

## RESUELTO DESDE EL HANDOFF ANTERIOR
- Los 10 hallazgos de `INFORME_CODE_REVIEW_2026-08-29.md` (informe ya borrado tras resolverse, por decisión del usuario) están commiteados y pusheados en `f9f10d5`: catálogo público movido fuera de `(protected)`, RLS de `bookings_update` con guard de columnas (migración 032), Storage RLS para Coordinador (migración 033), canje de cupón atómico (migración 034), timezone del cron corregido a `-03:00` explícito, V/F "Sin responder" distinguido de "Falso", errores de action ya no se descartan silenciosamente en los toggles de admin, RPC `get_user_discount` condicional a que no haya cupón, limpieza de archivo huérfano en Storage si falla el insert, horas de ocupación derivadas de `BOOKING_OPEN_HOUR`/`BOOKING_CLOSE_HOUR` en vez de hardcodeadas.

## Handoffs anteriores

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
