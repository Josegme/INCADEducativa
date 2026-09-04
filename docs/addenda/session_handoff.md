# Session Handoff — 2026-09-04 (T11 — checklist E3 + fix real de flag de compra/suscripción — MODO NORMAL)

## MODO: NORMAL

## T11 — EN CURSO (checklist actualizado + 1 bug real cerrado, sin commitear)

Tras `/recap` (gates verdes sobre HEAD `8112e87`, PR MERGEABLE, 36
migraciones Remote=Local) y `/continuar`, se tomó T11 de la cola
(`resolver_loop1.md`).

1. **Checklist actualizado** (`docs/FUNCIONALIDADES.md` §6 y §7): se
   verificó en código (no se confió en el estado previo del doc) que ya
   funcionan: compra individual de curso (migración 035,
   `purchaseCourseAction`, branch `curso:` del webhook), suscripción
   mensual (migración 036, `createCatalogSubscriptionAction`, branch
   `subscription_preapproval`), acceso a contenido tras pago
   (`enrollments` insert en el webhook), clases/evaluaciones/certificado
   para `comunidad` (mismo mecanismo genérico sin restricción de rol en
   las RLS), talleres para `comunidad` (`inscribirseTallerAction` "sin
   restricción de rol"), y `promote_lead_on_course_payment()` (CU-T03,
   idempotente, auditado en `role_history`). Sigue sin marcar: tutorías
   add-on pago (T13, no implementado).

2. **Bug real encontrado y corregido**: la compra individual y la
   suscripción de cursos estaban gateadas por `flags.comunidad`
   (`FEATURE_COMUNIDAD`, el flag del foro — E3 pero módulo distinto, ni
   siquiera construido todavía, T14) en vez de `flags.publica`
   (`FEATURE_PUBLICA`, el flag real de "apertura pública" que ya gatea
   `/cursos` en `middleware.ts` y que la propia CLAUDE.md describe como
   paraguas de "catálogo abierto, suscripciones, leads"). Efecto real:
   si el Admin togglea `FEATURE_PUBLICA=true` (como dice la tabla de
   decisiones de `resolver_loop1.md`) pero deja `FEATURE_COMUNIDAD=false`
   (foro sin construir, sin motivo para prenderlo), el botón de compra/
   suscripción seguía mostrando "disponible próximamente" — el flag
   correcto no habilitaba la feature que se supone que abre. El script
   de verificación de la sesión anterior (`verify-compra-suscripcion-tmp.js`)
   nunca lo detectó porque bypassea la UI/action y escribe directo contra
   la DB. Corregido en 4 puntos + 2 comentarios desactualizados:
   `cursos/[slug]/page.tsx`, `cursos/suscripcion/page.tsx`,
   `purchaseCourseActions.ts`, `subscriptionActions.ts`,
   `CoursePurchaseForm.tsx`, `SubscribeForm.tsx`.

3. **DoD verificado**: `npx tsc --noEmit` OK, `npm run lint` OK (mismo
   warning preexistente de `jsx-a11y/alt-text`), `npm run test:unit` OK
   (17/17). `npm run build` no se corrió en esta pasada.

4. **Pendiente de esta sesión**: diff mostrado al usuario, esperando
   aprobación explícita para `git commit` (regla no negociable, nunca
   automático). No se tocó el resto del alcance de T11 (UI admin de
   precios ya existía — `/admin/suscripciones` con CRUD de planes,
   `/admin/cursos` con campo `precio` — no hacía falta nada nuevo ahí).

## ESTADO PREVIO (2026-09-03, T10 cerrada)

La tarea bloqueante de FREEZE quedó resuelta: 034, 035 y 036 aplicadas
contra producción y verificadas funcionalmente. La cola está al día
(T1-T10 DONE o BLOCKED-ESPERANDO-HUMANO según corresponda; T11-T15
son las slices nuevas de Etapa 3, ver `resolver_loop1.md`). Se puede
seguir con desarrollo normal desde la cola.

## T10 CERRADA — desbloqueo de DB (compra/suscripción de cursos)

1. El fix de `034_coupon_redeem_atomic.sql` ya estaba commiteado
   (`18e1414`) desde antes.
2. Se detectó un segundo bug del mismo origen al intentar aplicar:
   `035_compras_curso.sql` y `036_catalogo_suscripciones.sql` usaban
   `uuid_generate_v4()` sin calificar — mismo bug ya resuelto antes en
   la migración 022 (`db58f37`): `supabase db push` no incluye
   `extensions` en el `search_path` de la sesión. Corregido en
   `1567e35`/`dd66235` (calificado como `extensions.uuid_generate_v4()`),
   commiteado y pusheado.
3. El usuario corrió `supabase db push --yes` en su propia terminal (el
   classifier de Auto mode volvió a bloquearlo dos veces desde acá) —
   aplicó 034+035+036 sin error.
4. `supabase migration list` confirmado el 2026-09-03: Remote = Local
   en las 36 migraciones.
5. Verificación funcional contra producción con
   `verify-compra-suscripcion-tmp.js` (script temporal, sin commitear,
   mismo criterio que `verify-fase3-tmp.js`): compra individual de
   curso (guard de idempotencia del webhook, enrollment,
   `promote_lead_on_course_payment()`, `role_history`, notificación de
   bienvenida, reintento idempotente) y suscripción mensual (RLS de
   auto-alta, `has_active_course_subscription()` antes/después de
   activar, RLS que bloquea la reedición propia una vez activa,
   inscripción perezosa vía suscripción) — **todos los checks en
   verde**. Fixtures de prueba limpiados y confirmados sin residuo
   (`courses`/`catalogo_planes`/`compras_curso`/`catalogo_suscripciones`
   verificados vacíos de datos de QA tras la corrida).

## ESTADO ACTUAL
- Rama activa: `fix/db-search-path-024`
- Último commit: `dd66235` (pusheado — `origin/fix/db-search-path-024`
  en sync, 0 ahead / 0 behind).
- PR #1: OPEN. `mergeable` no reconsultado en esta pasada — ver nota de
  la sesión anterior en "Handoffs anteriores" antes de asumir
  "MERGEABLE" sin volver a chequear.
- `docs/addenda/resolver_loop1.md` tiene T10-T15 nuevas (slices de la
  propuesta de campaña reformuladas, ver commit `93b59f5`). T10 ahora
  DONE, T11-T15 siguen sin arrancar.

## RESULTADO DE LOS GATES DE CI (verificado 2026-09-02, sobre HEAD `7992b22` — sin cambios de código desde entonces, solo docs + SQL)
- `npx tsc --noEmit` → OK, sin errores
- `npm run lint` → OK, 0 errores (1 warning preexistente
  `jsx-a11y/alt-text` en `src/lib/certificatePdf.tsx`, no bloqueante)
- `npm run test:unit` → OK, 17/17 passed (3 archivos)
- GitHub Actions, run `33523997424` (2026-09-01T15:10 UTC): job
  `quality` → SUCCESS. Job `e2e` → FAILURE, pero tiene
  `continue-on-error: true` en `ci.yml`, no bloquea el gate real.
- `npm run build` no se corrió en esta pasada.

## PRÓXIMA TAREA SUGERIDA (vía /continuar)
1. T11 (checklist real de E3 en `FUNCIONALIDADES.md`) — buen punto de
   partida, bajo riesgo.
2. T12-T14 (nurturing, tutorías pago, foro) — cada una con su propio
   checkpoint según la tabla de decisiones de `resolver_loop1.md`.
3. T6 (rotar service role key) y T7 (Supabase staging, 36 migraciones a
   replicar) siguen 100% manuales/BLOCKED, sin cambios.

## PENDIENTES SIN RESOLVER (arrastrados)
- `verify-fase3-tmp.js` y `verify-compra-suscripcion-tmp.js` sin
  trackear en la raíz del repo — scripts temporales de verificación,
  deliberadamente sin commitear
- Archivos demo del wizard de Sentry (`sentry-example-api`,
  `sentry-example-page`, `global-error.tsx`) sin limpiar antes de
  producción real — parte del alcance de T15
- Comentario desactualizado en
  `src/app/(dashboard)/layout.tsx:143-145` ("la única rama que llega
  hasta acá es /carreras") — cosmético, parte del alcance de T15
- `docs/FUNCIONALIDADES.md:462` sigue describiendo el deploy de Vercel
  como "BLOCKED-ESPERANDO-HUMANO, sin proyecto vinculado" — obsoleto,
  parte del alcance de T15
- Corrección de T8 (env vars productivas) del handoff 2026-09-02 sigue
  vigente sin cambios: `ANTHROPIC_API_KEY`, `MP_ACCESS_TOKEN`,
  `MP_WEBHOOK_SECRET`, `TWILIO_*` siguen sin valor en `.env.local`

## RESUELTO DESDE EL HANDOFF ANTERIOR
- Migraciones 034, 035 y 036 aplicadas contra producción y verificadas
  funcionalmente (ver T10 arriba) — cierra la tarea bloqueante que tenía
  el proyecto en MODO FREEZE desde el 2026-09-01.

## Handoffs anteriores

### Session Handoff — 2026-09-03 (puesta a punto tras /recap — MODO FREEZE, previo a aplicar 034-036)

#### MODO: FREEZE (según ese momento)
La tarea bloqueante era aplicar las migraciones 034+035+036 contra
producción. `/continuar` no debía arrancar ninguna feature nueva hasta
que esa tarea estuviera DONE y confirmada.

#### TAREA PENDIENTE BLOQUEANTE (según ese momento)
1. Corrección sobre un handoff anterior: el fix de
   `034_coupon_redeem_atomic.sql` ya estaba commiteado (`18e1414`) desde
   antes de que se abriera el FREEZE — el handoff de esa sesión lo daba
   por pendiente por error de redacción.
2. Pendiente real: correr `supabase db push --yes` contra producción
   (034/035/036 seguían sin aplicar, confirmado con
   `supabase migration list`).
3. Una vez aplicado: verificar funcionalmente compra de curso y
   suscripción — esto es justo lo que se cerró en la sesión siguiente
   (ver T10 arriba).

#### CORRECCIÓN — T8 (env vars productivas) tenía un error de interpretación
El handoff del 2026-09-01 decía que solo faltaba `CRON_SECRET` y que
las otras 6 (`ANTHROPIC_API_KEY`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`,
`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`) ya
tenían valor cargado localmente. Eso salió de correr el `comm` de
`/recap` en la dirección que trae el propio comando del skill, que
calcula lo inverso de lo que describe. Corriendo la dirección correcta:
esas 6 variables **siguen sin valor** en `.env.local`. Sigue vigente,
sin cambios en la sesión del 09-03.

#### ESTADO ACTUAL (según ese momento)
- Último commit: `7992b22` (pusheado, 0 ahead/0 behind).
- PR #1: OPEN. `gh pr view` reportó `mergeable: UNKNOWN` — no se pudo
  afirmar "MERGEABLE" categóricamente como decían handoffs anteriores.

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
