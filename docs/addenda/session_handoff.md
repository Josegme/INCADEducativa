# Session Handoff — 2026-09-01 06:10 UTC

## ESTADO ACTUAL
- Rama activa: `fix/db-search-path-024`
- Último commit: `8fbaa04` (pusheado — `origin/fix/db-search-path-024` en sync, 0 ahead / 0 behind)
- PR #1: OPEN, MERGEABLE. CI sobre `f9f10d5` confirmado: `quality` → pass (41s). CI sobre `8fbaa04` (el fix de middleware, último de la sesión) no se llegó a chequear en Actions antes de cerrar — confirmar con `gh pr checks fix/db-search-path-024` al retomar. `e2e` viene fallando desde antes por gap de secrets de Supabase (ver abajo), no por código.

## RESULTADO DE LOS 4 GATES (verificado local, esta sesión, sobre HEAD `8fbaa04`)
- `npx tsc --noEmit` → OK, sin errores
- `npm run lint` → OK, 0 errores (1 warning preexistente `jsx-a11y/alt-text` en `src/lib/certificatePdf.tsx`, no bloqueante)
- `npm run test:unit` → OK, 17/17 passed (3 archivos)
- `npm run build` + `npm run start -p 3100` + `curl` anónimo → manifest.json/sw.js/icons pasan de 307→/login a 200 con content-type correcto; `/dashboard` (control) sigue protegido igual que antes.
- CI en GitHub Actions sobre `33279775859`/`33473351021`: `quality` pass, `e2e` fail — falla por falta de secrets de Supabase en el entorno de Actions ("Your project's URL and Key are required to create a Supabase client"), no por un bug de código.

## MODO: NORMAL
Cola al día, gates verdes localmente, T9 (PWA) avanzado con un fix real de middleware. Falta confirmar CI en Actions sobre `8fbaa04`. `e2e` sigue rojo por el gap de secrets, arrastrado, no relacionado a los commits de hoy.

## PRÓXIMA TAREA SUGERIDA (vía /continuar)
1. Confirmar en GitHub Actions que `quality` sigue verde sobre `8fbaa04`.
2. T9 (PWA) sigue PARCIAL: el bug de middleware que bloqueaba manifest/sw/icons para visitantes sin sesión está resuelto y verificado por curl, pero la corrida oficial de Lighthouse ("PWA en verde/installable") sigue sin hacerse — el CLI de `lighthouse` falla en este entorno Windows con `EPERM` al limpiar el tmp dir de `chrome-launcher` al cerrar Chrome (bug conocido de la herramienta, no del repo) y la extensión de Chrome no estaba conectada en esta sesión. Si se soluciona uno de esos dos accesos, correr Lighthouse contra `/`, `/login` y `/cursos` para cerrar el DoD.
3. Si se quiere `e2e` verde en CI: cargar los secrets de Supabase que necesita el `webServer` de Playwright (`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` u otros que arme `.env.local`) como Secrets del repo en GitHub — 100% manual, dashboard de GitHub.
4. Retomar T4/T6/T7/T8 de `resolver_loop1.md` (gates 100% manuales) o seguir con deuda funcional E1/E2 fuera de cola.

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
