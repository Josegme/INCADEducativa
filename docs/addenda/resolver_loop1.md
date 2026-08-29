ROL: Actuás como ingeniero DevOps + QA senior sobre el repo INCADEducativa
(Next.js 14 App Router + Supabase). Es un repo real en producción de MVP, no
greenfield. Fuente de verdad: CLAUDE.md y docs/FUNCIONALIDADES.md — leelos
antes de tocar cualquier archivo. Respetá SIEMPRE las reglas críticas de
CLAUDE.md (is_admin() en policies RLS, ledger append-only, nomenclatura en
español en DB, convert_user_role() nunca UPDATE directo de role, etc.)

REGLAS DE EJECUCIÓN (no negociables):
1. Nunca hagas `git commit` ni `git push` sin mi aprobación explícita. Al
   terminar cada tarea, mostrame diff + resumen + mensaje de commit propuesto
   (Conventional Commits) y esperá mi "dale"/"aprobado" antes de commitear.
2. Nunca edites una migración SQL ya existente (001–023). Todo cambio de
   schema va en un archivo nuevo con el siguiente número secuencial.
3. Nunca escribas ni asumas un secreto/API key real. Si una tarea requiere un
   valor que solo existe en un dashboard externo (Vercel, Supabase, Sentry,
   Resend, MercadoPago, Twilio, registrador de dominio), generá la lista
   exacta de pasos manuales + comandos, marcá la tarea BLOCKED, y seguí con
   la siguiente tarea AUTO de la cola sin quedarte trabado.
4. Trabajá una tarea a la vez, en el orden de la cola. No saltes de fase
   hasta que la anterior esté DONE o BLOCKED.
5. Definition of Done de cualquier tarea de código: `npx tsc --noEmit` sin
   errores + `npm run lint` sin errores nuevos + `npm run test:unit` en
   verde + `npm run build` compila. Corré los 4 vos mismo antes de marcar
   DONE. Si falla, diagnosticá y arreglá en el mismo ciclo (máx 3 intentos);
   si no se resuelve, marcá BLOCKED y explicá por qué.

## ESTADO REAL VERIFICADO — 2026-08-29 13:25 UTC (via /recap + /poner-a-punto)

Esta cola quedó redactada cuando la última migración era 024. Hoy (rama
`fix/db-search-path-024`, HEAD `4c1b241`, pusheado y en sync con origin)
hay 31 migraciones y trabajo importante fuera de esta cola (4 agujeros de
RLS cerrados, reestructura de `(protected)/`, motor de evaluaciones,
página de perfil, notificaciones). Los 4 gates (tsc/lint/test:unit +
gradeAttempt) están verdes sobre ese HEAD. Detalle tarea por tarea abajo,
sin borrar nada de lo original.

COLA DE TAREAS:

[T1 · AUTO] Resincronizar package-lock.json
> ESTADO VERIFICADO (2026-08-29): DONE. `npm ci` corre limpio (exit 0,
> 811 paquetes) sobre el lockfile actual del HEAD `4c1b241`.
- `npm install` para resincronizar, confirmar que `npm ci` después corre
  limpio (es el mismo comando que usa .github/workflows/ci.yml).
- El diff debe ser mínimo — sin downgrades ni deps nuevas no relacionadas.
- DoD: `npm ci` sale sin error EUSAGE.

[T2 · AUTO] Migración 024 — search_path en funciones SECURITY DEFINER
Funciones detectadas hoy (verificá firma exacta en el archivo fuente antes
de escribir el ALTER, no la copies de acá a ciegas):
  - is_admin() — 001
  - is_role(p_role user_role) — 001
  - verify_certificate(p_uuid uuid) — definida en 001, redefinida en 023
    (misma firma en ambas, usar esa)
  - recalculate_progress(p_user_id uuid, p_course_id uuid) — 001
  - trg_recalculate_progress() — 001 (trigger function)
  - detect_no_shows() — 002
  - get_user_discount() — 002
  - apply_manual_correction() — 003 (trigger function)
  - can_teach_course(p_course_id uuid) — 004
  - convert_user_role(...) — 004, firma completa en ese archivo
  - award_points(...) — 005, firma completa en ese archivo
  - get_occupied_slots(p_space_id uuid, p_from timestamptz, p_to timestamptz) — 013
  - detect_completed_bookings() — 017
  - detect_completed_tutorias() — 018
  - get_taller_inscripcion_count(p_taller_id uuid) — 019
  - verify_career_certificate(p_uuid uuid) — 022
- Creá supabase/migrations/024_security_definer_search_path.sql con un
  `ALTER FUNCTION public.<nombre>(<firma_exacta>) SET search_path = public;`
  por cada una. No reescribas los CREATE OR REPLACE existentes.
- No apliques la migración contra ninguna DB real (local ni Supabase) sin
  mi confirmación explícita — solo dejá el archivo listo para revisión.
- DoD: archivo creado; si hay Docker/Postgres local disponible, validá
  sintaxis levantando una instancia efímera; si no, al menos confirmá que
  cada firma coincide grepeando el CREATE OR REPLACE correspondiente.

> ESTADO VERIFICADO (2026-08-29): PARCIAL. Archivo
> `024_security_definer_search_path.sql` existe y está commiteado
> (`4803234`, ya en `origin/main`). Aplicación real contra una DB
> (local o Supabase) sigue sin confirmarse — no verificable desde git/CLI
> local, requiere acceso a la DB real. No se lo vuelve a marcar DONE
> hasta que alguien confirme esa aplicación.

[T3 · GATE] CI verde en GitHub tras el fix del lockfile
- Recién después de que yo apruebe y commitee T1+T2: creá rama, empujala,
  abrí PR si hay `gh` autenticado, y `gh run watch` hasta que el job
  `quality` de ci.yml pase.
- Sin `gh` autenticado o sin permisos de push: dame los comandos exactos
  para correrlo yo y marcá BLOCKED.
- No toques el `continue-on-error: true` del job `e2e` todavía.
- DoD: job `quality` (tsc + lint + vitest) en verde en Actions.

> ESTADO VERIFICADO (2026-08-29): PARCIAL. PR #1 existe (OPEN,
> MERGEABLE). Localmente sobre HEAD `4c1b241`: tsc/lint/test:unit en
> verde. Pero los checks visibles en GitHub Actions son del 2026-08-23,
> anteriores a los 7 commits recién pusheados hoy — falta correr
> `gh pr checks` o `gh run watch` sobre este HEAD para confirmar
> `quality` verde en Actions, no solo local. No marcar DONE hasta esa
> confirmación.

[T4 · GATE] Deploy Vercel + dominio incadeducativa.com + envs por ambiente
- Chequeá `vercel whoami`. Si está logueado: `vercel link`, armá la carga
  de env vars por ambiente (production/preview/development) usando las
  claves de .env.example como plantilla — sin inventar valores, pedime
  cada secreto real uno por uno.
- Sin CLI/login: dame el runbook exacto y marcá BLOCKED.
- El DNS del dominio es 100% manual — solo dame los registros exactos que
  pide Vercel una vez linkeado el proyecto, y parate ahí.
- DoD: proyecto linkeado, envs cargados en los 3 ambientes, DNS
  confirmable con `vercel domains inspect incadeducativa.com`.

> ESTADO VERIFICADO (2026-08-29): DESCONOCIDO. Vercel CLI no está
> instalada en este entorno (recomendado por el propio harness:
> `npm i -g vercel`). No verificable desde acá sin esa herramienta.
> Sigue BLOCKED-ESPERANDO-HUMANO heredado del 2026-08-18, sin
> confirmación posterior.

[T5 · GATE] Sentry activo
- `npx @sentry/wizard@latest -i nextjs` (login interactivo — avisame si
  necesitás que lo autorice en el navegador).
- DSN real va a Vercel envs, no a .env.local del repo.
- DoD: configs de Sentry generadas, `npm run build` sigue pasando, un
  error de prueba forzado aparece en el dashboard.

> ESTADO VERIFICADO (2026-08-29): PARCIAL. Archivos generados presentes
> (`src/instrumentation.ts`, etc.) y `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`
> tienen valor cargado en `.env.local`. No verificable desde acá si un
> evento de prueba aparece en el dashboard de Sentry (requiere acceso
> externo) — no marcar DONE sin esa confirmación humana.

[T6 · GATE] Rotar SUPABASE_SERVICE_ROLE_KEY
- Ya confirmé que .env.local nunca estuvo en el historial de git (riesgo
  bajo), pero rotala igual antes de producción real — el repo ya es
  público hoy.
- 100% manual (Supabase Dashboard → Settings → API → rotate). Dame el
  paso a paso y marcá BLOCKED — pegame la key nueva cuando la tengas y
  vos la cargás en Vercel/.env.local, nunca la escribas en texto plano
  en este chat de Cursor.
- DoD: key rotada, Vercel envs actualizados, key vieja devuelve 401.

> ESTADO VERIFICADO (2026-08-29): BLOCKED-ESPERANDO-HUMANO. 100% manual
> en Supabase Dashboard, no verificable ni ejecutable desde acá.

[T7 · GATE] Supabase staging separado de producción
- Chequeá `supabase projects list`. Si hay CLI/login:
  `supabase projects create incadeducativa-staging` y replicá las 24
  migraciones (001–024) con `supabase db push`.
- Sin CLI/login: runbook manual y marcá BLOCKED.
- DoD: proyecto staging existe, 24 migraciones corridas limpias ahí, env
  "preview" de Vercel apunta a esa instancia, no a producción.

> ESTADO VERIFICADO (2026-08-29): DESCONOCIDO, además OBSOLETO en el
> número de migraciones: el DoD dice "24 migraciones" pero hoy hay 31
> (`ls supabase/migrations/ | wc -l` → 31, última `031_rls_hardening.sql`).
> No se corrió `supabase projects list` en este /recap (fuera del set de
> comandos de solo lectura definido ahí). Actualizar el número a 31 antes
> de ejecutar esta tarea.

[T8 · GATE] RESEND_API_KEY / MP_ACCESS_TOKEN / TWILIO_* productivos
- 100% manual (cuentas de terceros). Para cada uno dame: link exacto al
  dashboard de la key productiva, variable de .env.example que le
  corresponde, y si hace falta algún cambio de código para pasar de
  sandbox a producción (revisá src/lib/mercadopago/ por si el modo test
  está hardcodeado).
- No toques código salvo que detectes ese hardcodeo — avisame antes.
- DoD: 3 keys cargadas en Vercel production; confirmación mía de un pago
  real de prueba procesado correctamente por el webhook (lo corro yo).

> ESTADO VERIFICADO (2026-08-29): BLOCKED-ESPERANDO-HUMANO. Confirmado
> por `comm` sobre `.env.example` vs `.env.local`: sin valor cargado
> localmente: `ANTHROPIC_API_KEY`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`,
> `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`.

[T9 · AUTO] PWA — manifest + service worker
- Implementá public/manifest.json (íconos, nombre, colores del Design
  System — violeta #9B30FF, tokens --edu-*) y un service worker mínimo
  (cache-first para assets estáticos, network-first para rutas
  dinámicas). Usá next-pwa o uno manual, tu criterio — revisá
  docs/design/DESIGN_SYSTEM_INCADEducativa.md antes de elegir assets.
- DoD: Lighthouse PWA en verde/installable, build sigue pasando, ninguna
  ruta existente se rompe.

> ESTADO VERIFICADO (2026-08-29): PARCIAL. `public/manifest.json` existe.
> No se corrió Lighthouse en este /recap (fuera del set de comandos de
> solo lectura) — no marcar DONE completo sin esa corrida.

## FUERA DE COLA — trabajo verificado en la rama, no estaba en esta lista original

Los siguientes commits en `fix/db-search-path-024` (ya pusheados, HEAD
`4c1b241`) no corresponden a ninguna tarea T1-T9 de arriba. Se documentan
acá para que la cola no quede ciega a ellos:

- `abb3a5c` — fix: cierre de 4 agujeros de RLS (users/evaluations/
  attempts/bookings) + bugs del motor de evaluaciones (V/F sin
  responder, opción múltiple proporcional, robo de intentos, cronómetro
  con closure viejo)
- `1c747f0` — wip: reestructura `(protected)/` y deuda funcional E1/E2
  (migraciones 027-030)
- `884c1b2`, `fc66edb`, `738dc88` — resync de lockfile, merge de code
  review y tipado de `get_evaluation_for_attempt`
- `02aab85` — test: fix de expectativa de `gradeAttempt` + cobertura del
  caso "marcar todas las opciones" (regresión de test, no de motor —
  diagnosticado y corregido en esta sesión)
- `4c1b241` — chore: versionar `.claude/commands/*.md`

ESTADO: DONE (commiteado y pusheado). Pendiente: confirmar en Actions
que el job `quality` sigue verde sobre este HEAD (ver nota de T3 arriba).

PROTOCOLO DEL LOOP:
1. Tomá T1 → ejecutá → verificá DoD → mostrame diff + resumen + mensaje
   de commit sugerido → esperá aprobación.
2. Al aprobar, seguí a T2 automáticamente sin que te lo pida de nuevo.
3. Al llegar a un GATE sin credenciales disponibles: generá el runbook,
   marcá BLOCKED-ESPERANDO-HUMANO, y seguí con la próxima tarea AUTO de
   la cola en paralelo (T9 puede resolverse mientras T4–T8 esperan).
4. Reportá cada tarea en este formato fijo, sin relleno:

TAREA: T<n> — <nombre>
ESTADO: DONE | BLOCKED | FAILED
VERIFICACIÓN: <comandos corridos y resultado>
SIGUIENTE ACCIÓN REQUERIDA: <qué necesitás de mí, si algo>

5. Cuando toda la cola esté DONE o BLOCKED, dame una tabla final:
   tarea | estado | bloqueante (si aplica).