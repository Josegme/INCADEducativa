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

COLA DE TAREAS:

[T1 · AUTO] Resincronizar package-lock.json
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

[T3 · GATE] CI verde en GitHub tras el fix del lockfile
- Recién después de que yo apruebe y commitee T1+T2: creá rama, empujala,
  abrí PR si hay `gh` autenticado, y `gh run watch` hasta que el job
  `quality` de ci.yml pase.
- Sin `gh` autenticado o sin permisos de push: dame los comandos exactos
  para correrlo yo y marcá BLOCKED.
- No toques el `continue-on-error: true` del job `e2e` todavía.
- DoD: job `quality` (tsc + lint + vitest) en verde en Actions.

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

[T5 · GATE] Sentry activo
- `npx @sentry/wizard@latest -i nextjs` (login interactivo — avisame si
  necesitás que lo autorice en el navegador).
- DSN real va a Vercel envs, no a .env.local del repo.
- DoD: configs de Sentry generadas, `npm run build` sigue pasando, un
  error de prueba forzado aparece en el dashboard.

[T6 · GATE] Rotar SUPABASE_SERVICE_ROLE_KEY
- Ya confirmé que .env.local nunca estuvo en el historial de git (riesgo
  bajo), pero rotala igual antes de producción real — el repo ya es
  público hoy.
- 100% manual (Supabase Dashboard → Settings → API → rotate). Dame el
  paso a paso y marcá BLOCKED — pegame la key nueva cuando la tengas y
  vos la cargás en Vercel/.env.local, nunca la escribas en texto plano
  en este chat de Cursor.
- DoD: key rotada, Vercel envs actualizados, key vieja devuelve 401.

[T7 · GATE] Supabase staging separado de producción
- Chequeá `supabase projects list`. Si hay CLI/login:
  `supabase projects create incadeducativa-staging` y replicá las 24
  migraciones (001–024) con `supabase db push`.
- Sin CLI/login: runbook manual y marcá BLOCKED.
- DoD: proyecto staging existe, 24 migraciones corridas limpias ahí, env
  "preview" de Vercel apunta a esa instancia, no a producción.

[T8 · GATE] RESEND_API_KEY / MP_ACCESS_TOKEN / TWILIO_* productivos
- 100% manual (cuentas de terceros). Para cada uno dame: link exacto al
  dashboard de la key productiva, variable de .env.example que le
  corresponde, y si hace falta algún cambio de código para pasar de
  sandbox a producción (revisá src/lib/mercadopago/ por si el modo test
  está hardcodeado).
- No toques código salvo que detectes ese hardcodeo — avisame antes.
- DoD: 3 keys cargadas en Vercel production; confirmación mía de un pago
  real de prueba procesado correctamente por el webhook (lo corro yo).

[T9 · AUTO] PWA — manifest + service worker
- Implementá public/manifest.json (íconos, nombre, colores del Design
  System — violeta #9B30FF, tokens --edu-*) y un service worker mínimo
  (cache-first para assets estáticos, network-first para rutas
  dinámicas). Usá next-pwa o uno manual, tu criterio — revisá
  docs/design/DESIGN_SYSTEM_INCADEducativa.md antes de elegir assets.
- DoD: Lighthouse PWA en verde/installable, build sigue pasando, ninguna
  ruta existente se rompe.

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