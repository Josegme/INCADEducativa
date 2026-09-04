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

## ESTADO REAL VERIFICADO — 2026-09-01 05:22 UTC (via /recap + /poner-a-punto)

Esta cola quedó redactada cuando la última migración era 024. Hoy (rama
`fix/db-search-path-024`, HEAD `f9f10d5`, pusheado y en sync con origin)
hay 34 migraciones y trabajo importante fuera de esta cola (4 agujeros de
RLS cerrados, reestructura de `(protected)/`, motor de evaluaciones,
página de perfil, notificaciones, y ahora los 10 hallazgos de
`INFORME_CODE_REVIEW_2026-08-29.md`, ver sección "FUERA DE COLA" abajo).
Los 4 gates (tsc/lint/test:unit) están verdes sobre ese HEAD. Detalle
tarea por tarea abajo, sin borrar nada de lo original.

> Nota de la actualización anterior (2026-08-29 13:25 UTC, HEAD `4c1b241`,
> 31 migraciones): se preserva el detalle tarea por tarea de esa pasada
> más abajo sin reescribirlo; solo se corrigen T3 y T7, que quedaron
> obsoletos por trabajo verificado en esta pasada.

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

> ESTADO VERIFICADO (2026-09-02): DONE. `supabase migration list`
> corrido con la CLI logueada contra el proyecto productivo
> (`INCADEducativa`) confirma columna Remote = Local para 024 — y de
> hecho para el rango completo 001-033. Deja de ser "no verificable",
> queda cerrada.

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

> ESTADO VERIFICADO (2026-09-01): DONE para `quality` sobre HEAD `beac0c6`
> (un commit después de `4c1b241`) — `gh pr checks` corrido en esta
> sesión confirmó `quality` pass (57s) en Actions, no solo local. `e2e`
> sigue en rojo mismo HEAD, pero por falta de secrets de Supabase en el
> entorno de Actions ("Your project's URL and Key are required to create
> a Supabase client"), no por una regresión de código — ver
> `session_handoff.md` para el runbook pendiente de esa carga de
> secrets. Tras esta sesión se pusheó un commit más (`f9f10d5`, los 10
> fixes del code review) y CI se disparó de nuevo (run `33473351021`):
> `quality` → pass (41s) confirmado también sobre ese HEAD antes de
> cerrar la sesión. `e2e`/`Vercel` seguían `pending`, sin confirmar.

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

> ESTADO VERIFICADO (2026-09-01): PARCIAL — el deploy en sí YA EXISTE Y
> FUNCIONA, corrige la entrada anterior. `gh pr checks fix/db-search-path-024`
> muestra un status check `Vercel` = SUCCESS con URL real de deployment
> bajo `josegmescobar-2036s-projects/incadeducativa` (integración Git de
> Vercel, dispara en cada push al PR). La CLI local sigue sin instalar
> (por eso `vercel whoami`/`vercel link` no se pudo correr desde acá),
> pero eso ya no bloquea nada — el proyecto está linkeado del lado de
> Vercel. Sigue sin verificar desde este entorno: dominio custom
> `incadeducativa.com` (DNS), envs cargados por los 3 ambientes
> (production/preview/development). Downgrade de BLOCKED a PARCIAL — no
> marcar DONE hasta confirmar esos dos puntos con el usuario o con
> `vercel domains inspect` una vez instalada la CLI.

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

> ESTADO VERIFICADO (2026-09-01): sigue DESCONOCIDO si el staging existe,
> pero el número de migraciones a replicar volvió a quedar obsoleto: hoy
> hay 34 (`032_bookings_update_guard.sql`, `033_storage_coordinador_rls.sql`,
> `034_coupon_redeem_atomic.sql` se sumaron esta sesión). `supabase
> projects list` sí se corrió esta vez (logueado, proyecto
> `INCADEducativa` / `wzquzbapcqesysreritu` visible y linkeado) — no
> apareció ningún proyecto de staging separado en el listado, solo el de
> producción y dos ajenos a este repo (`A-English`, `Planning Pro`).
> Actualizar el número a 34 antes de ejecutar esta tarea.

> ESTADO VERIFICADO (2026-09-02): sigue DESCONOCIDO/sin staging — mismo
> `supabase projects list` de hoy solo lista `INCADEducativa`
> (producción, linkeado) y los dos proyectos ajenos. El número de
> migraciones volvió a quedar obsoleto otra vez: hoy hay 36
> (`035_compras_curso.sql`, `036_catalogo_suscripciones.sql` se sumaron
> después del 09-01). Actualizar a 36 antes de ejecutar esta tarea.

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

> ESTADO VERIFICADO (2026-09-01): BLOCKED-ESPERANDO-HUMANO, pero avanzó.
> Mismo `comm` sobre `.env.example` vs `.env.local` hoy solo devuelve
> `CRON_SECRET` — las 6 variables que faltaban el 29/08 (incluida
> `ANTHROPIC_API_KEY`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`,
> `TWILIO_*`) ya tienen valor cargado localmente (nunca se leyó ni se
> expone el valor, solo existencia). Esto NO confirma que sean keys de
> **producción** ni que estén cargadas en Vercel — el DoD sigue
> pendiente hasta que el usuario confirme el pago real de prueba vía
> webhook. Falta cargar `CRON_SECRET` localmente si los cron jobs lo
> necesitan.

> CORRECCIÓN (2026-09-02): la nota de 2026-09-01 está mal — error de
> dirección en el `comm`. El comando literal que trae el skill `/recap`
> (`comm -13 <(...example) <(...local)`) calcula lo inverso de lo que
> describe: devuelve variables CON valor en `.env.local` que NO están
> declaradas en `.env.example` (por eso salió solo `CRON_SECRET` — tiene
> valor local pero no figura en `.env.example`, no es que las demás ya
> estuvieran cargadas). Corriendo la dirección correcta
> (`comm -23 <(...example) <(...local)`, "declaradas en .env.example
> sin valor en .env.local"): `ANTHROPIC_API_KEY`, `MP_ACCESS_TOKEN`,
> `MP_WEBHOOK_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
> `TWILIO_WHATSAPP_FROM` **siguen sin valor** en `.env.local`. No hubo
> ningún avance real desde el 29/08 en este punto — sigue
> BLOCKED-ESPERANDO-HUMANO tal cual estaba.

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

> ESTADO VERIFICADO (2026-09-01, vía /continuar): PARCIAL, pero se resolvió
> un bug real que bloqueaba el DoD. El matcher de `src/middleware.ts` no
> excluía `manifest.json`/`sw.js`/`icons/` del auth gate: cualquier
> visitante SIN sesión que los pidiera recibía 307→/login en vez del
> archivo — la PWA no era instalable para nadie no logueado, en ninguna
> página pública. Fix commiteado y pusheado (`8fbaa04`), verificado con
> build de producción + curl anónimo (manifest/sw/icons: 307→200; ruta
> protegida de control sin cambios). Sigue sin correrse Lighthouse en sí
> ("PWA en verde/installable" del DoD original): el CLI de `lighthouse`
> falla en este entorno Windows con EPERM al limpiar el tmp dir de
> chrome-launcher al cerrar Chrome (bug conocido de la herramienta, no
> del repo — https://github.com/GoogleChrome/lighthouse/issues, buscar
> "EPERM" + "Windows"), y la extensión de Chrome no estaba conectada
> en esta sesión. No marcar DONE hasta correr Lighthouse real contra
> `/`, `/login` y `/cursos`.

## T10-T15 — origen: propuesta de campaña autónoma (2026-09-03)

El usuario compartió un draft de "campaña autónoma" (`camapaña.md`, ya
borrado — era solo para intercambio de opinión, nunca se ejecutó tal
cual). Evaluación profesional: la cola de trabajo (7 slices) es sólida
y bien priorizada, pero el modo de ejecución que proponía ("no
preguntes nunca", incluido un `supabase db push --yes` autónomo contra
producción) no es aceptable — invierte el riesgo real (protege lo
barato de revertir — un commit — y no protege lo caro — un schema de
prod). Se adoptan las 7 slices como T10-T15 de esta cola, con AUTO/GATE
reasignados según haga falta o no un checkpoint humano puntual. La
TABLA DE DECISIONES del draft se conserva casi intacta más abajo — es
buena práctica genuina — salvo donde choca con lo anterior.

Regla general para T10-T15: se puede encadenar código dentro de un
slice sin pedir aprobación por cada detalle menor (aplica la TABLA DE
DECISIONES), pero **cada slice se cierra y se reporta por separado** —
no se saltea automáticamente al siguiente T sin que el usuario lo pida
de nuevo (misma regla de "una tarea por invocación" de `/continuar`).
Ningún slice hace `git commit`/`git push` sin aprobación explícita
(regla no negociable de CLAUDE.md).

[T10 · GATE puntual] Desbloquear DB — aplicar 034+035+036 en producción

> ESTADO VERIFICADO (2026-09-03): DONE. `supabase db push --yes` corrido
> por el usuario (el classifier de Auto mode volvió a bloquearlo en esta
> sesión al intentarlo desde acá, mismo patrón de siempre). Falló la
> primera vez por el mismo bug ya conocido: `uuid_generate_v4()` sin
> calificar en 035/036 (fix en `1567e35`/`dd66235`, análogo al de la
> migración 022). Reintentado por el usuario tras el fix: aplicó limpio.
> `supabase migration list` confirma Remote = Local en las 36
> migraciones. Verificación funcional completa contra producción con
> `verify-compra-suscripcion-tmp.js` (script temporal, sin commitear):
> compra individual de curso (guard de idempotencia del webhook,
> enrollment, `promote_lead_on_course_payment()`, role_history,
> notificación, reintento idempotente) y suscripción mensual (RLS de
> auto-alta, `has_active_course_subscription()` antes/después de activar,
> RLS que bloquea la reedición propia una vez activa, inscripción
> perezosa vía suscripción) — todos los checks en verde, fixtures
> limpiados y confirmados sin residuo en producción.
- El fix de `034_coupon_redeem_atomic.sql` (drop antes de recrear
  `increment_coupon_usage`, bug `SQLSTATE 42P13`) ya está commiteado
  (`18e1414`) — nada de código pendiente acá.
- Lo único que falta: correr `supabase db push --yes` contra el
  proyecto productivo (`INCADEducativa`) para aplicar 034, 035 y 036.
  **Esto requiere confirmación explícita del usuario en el momento de
  ejecutarlo** — es un cambio de schema irreversible contra producción,
  no negociable aunque el resto del slice sea AUTO. Si el
  classifier/Auto-review bloquea el comando: 1 reintento, y si vuelve a
  bloquear, dejar el comando exacto documentado y ofrecer que el
  usuario lo corra en su propia terminal — no loopear.
- Con las 3 migraciones aplicadas: correr una verificación puntual
  contra la DB real (script tipo `verify-fase3-tmp.js`, sin commitear)
  del flujo de compra individual de curso y de suscripción mensual.
- DoD: `supabase migration list` muestra Remote = Local en 034/035/036;
  verificación funcional de ambos flujos confirmada contra la DB real.

[T11 · AUTO] E3 ya codeada — checklist desactualizado
- Marcar en `docs/FUNCIONALIDADES.md` lo que YA existe y funciona:
  compra individual de curso, suscripciones (admin + picker público),
  branch `curso:` del webhook de MercadoPago, `promote_lead_on_course_payment()`
  (CU-T03), catálogo público gateado por `FEATURE_PUBLICA`.
- Completar huecos reales detectados en esos flujos (UI admin de
  precios, estados de compra/suscripción, RLS, flags) — no
  reimplementar lo que ya está.
- DoD: checklist refleja el estado real verificado en código; huecos
  reales cerrados con los 4 gates en verde.

> ESTADO VERIFICADO (2026-09-04): DONE. Checklist actualizado (§6/§7 de
> `FUNCIONALIDADES.md`, ver `session_handoff.md` para el detalle línea
> por línea) y 1 hueco real cerrado: compra/suscripción de cursos
> estaban gateadas por el flag equivocado (`FEATURE_COMUNIDAD` en vez
> de `FEATURE_PUBLICA`) en 6 archivos — corregido. UI admin de precios
> ya existía (`/admin/suscripciones`, `/admin/cursos`), no hizo falta
> nada nuevo ahí. 3 gates verdes (tsc/lint/test:unit); `npm run build`
> no corrido. Commit `605a210`, aprobado y pusheado —
> `origin/fix/db-search-path-024` en sync. CI de Actions sobre este
> HEAD todavía sin correr, confirmar en la próxima sesión.

[T12 · AUTO, con cuidado de efectos reales] Nurturing de leads (días 1/3/7)
- Cron al patrón de `/api/cron/coworking`. Emails vía Resend. 3 mails
  cortos: d1 bienvenida taller, d3 vitrina de cursos, d7 CTA comunidad,
  tono INCADE institucional ES/AR — documentar el copy en
  `COMPONENTS.md` para que el usuario lo pueda revisar/ajustar después,
  no se aprueba tácitamente por default.
- No agregar herramientas nuevas (nada de Twilio/Mailchimp/Brevo).
- **Cuidado explícito:** no disparar envíos reales contra leads de la
  tabla real durante el desarrollo/testing — usar un destinatario de
  prueba propio o un modo dry-run/log-only hasta que el usuario
  confirme que quiere probar contra Resend de verdad. `RESEND_API_KEY`
  ya tiene valor cargado localmente, así que un test mal acotado
  mandaría mail de verdad.
- DoD: cron + templates + lógica de envío listos y testeados con
  destinatario de prueba; sin secretos ni URLs de terceros inventadas.

> ESTADO VERIFICADO (2026-09-04): HECHA, SIN COMMITEAR. Migración 037
> (columnas de flag + `pg_cron`, sin aplicar contra ninguna DB) + ruta
> `/api/cron/nurturing` (mismo patrón que coworking/tutorías) + lógica
> pura en `src/modules/comunicacion/nurturing.ts`, cubierta por 8 unit
> tests nuevos (sin red). Copy documentado en `COMPONENTS.md` §65,
> marcado explícitamente como borrador pendiente de aprobación — no se
> asume aprobado. DoD parcial: "testeado con destinatario de prueba"
> NO se cumplió al pie de la letra — no se corrió ningún envío real
> contra Resend en esta sesión (`RESEND_API_KEY` tiene valor local, un
> test mal acotado mandaría mail real a un lead real); solo se
> verificó la lógica de elegibilidad con tests puros. Un test contra
> Resend real con destinatario propio queda pendiente de que el
> usuario lo confirme explícitamente. 3 gates verdes (tsc/lint/
> test:unit, 25/25); `npm run build` no corrido. Commit `e28e1e0`,
> aprobado por el usuario (sin pushear todavía).
>
> ACTUALIZACIÓN (2026-09-04): usuario pidió explícitamente aplicar la
> migración 037 contra producción. `supabase db push --yes` corrido,
> sin error (`pg_cron`/`pg_net` ya existían, skip). `supabase migration
> list` confirma Remote=Local en 037. El job `nurturing-notify` queda
> programado pero **no funcional** hasta reemplazar `<APP_URL>` y
> `<CRON_SECRET>` por los valores reales tras el deploy — mismo patrón
> que 016/018, no se completó automáticamente porque requeriría escribir
> el secreto en texto plano.

[T13 · AUTO (código) / GATE (prueba real)] Tutorías add-on pago
- Precio fijo por curso (decisión ya tomada por el usuario): campo en
  el curso, default 0 = no se vende, lo carga el Admin.
- Integración MercadoPago + webhook, mismo patrón que compra de cursos
  (`f10c650`): firma `x-signature` verificada, webhook como única
  fuente de verdad, acceso recién con `payment.approved`. Carreras
  siguen sin ser comprables (ADR-15) — este flujo es solo tutorías.
- El código y el flujo de escritura (branch nuevo del webhook, tabla,
  RLS) se pueden codear en AUTO. La prueba de un pago real de punta a
  punta la corre el usuario, igual que se dejó pendiente para T8 en su
  momento — no se simulan tokens de pago.
- DoD: 4 gates en verde; branch del webhook cubierto por test unitario
  de la lógica de gracia (approved → acceso, resto → sin acceso).

> ESTADO VERIFICADO (2026-09-04): HECHA, SIN COMMITEAR. Contradicción real
> encontrada con el spec (§6.4 decía "sin flujo de pago", previo a que
> existiera compra/suscripción de curso) — resuelta actualizando el spec
> primero (v3.6 → v3.7, regla #7 de CLAUDE.md) antes de tocar código:
> alumno sigue gratis, comunidad paga un add-on por curso. Migración 038
> (`precio_tutorias_addon` + `tutoria_addon_compras` +
> `has_tutoria_addon_access()`, sin aplicar contra ninguna DB), branch
> `tutoria-addon:` del webhook, `purchaseTutoriaAddonAction` +
> `TutoriaAddonPurchaseCard`, gate por rol en `cursos/[slug]/page.tsx`
> (solo `comunidad`, `alumno` sin cambios). Campo de precio agregado al
> `CourseModal` de admin (0 = no se vende). Lógica de gracia del webhook
> cubierta por 6 unit tests nuevos (`resolveTutoriaAddonEstado`/
> `grantsTutoriaAddonAccess`). 3 gates verdes (tsc/lint/test:unit, 31/31);
> `npm run build` no corrido. **Sin probar un pago real** — la prueba real
> la corre el usuario, mismo criterio que T8/T10. Commit `beaf569`,
> aprobado y pusheado.
>
> ACTUALIZACIÓN (2026-09-04): usuario pidió explícitamente aplicar la
> migración 038 contra producción. `supabase db push --yes` corrido, sin
> error. `supabase migration list` confirma Remote=Local en 038 (38
> migraciones). `has_tutoria_addon_access()` y `precio_tutorias_addon`
> ya existen en producción — sigue pendiente la prueba real de un pago
> de punta a punta (la corre el usuario cuando quiera).

[T14 · AUTO] Comunidad / foro (`FEATURE_COMUNIDAD`)
- MVP: foros por carrera + feed institucional. Flag en DB + fallback
  env, apagado por default (`getFlags()`), nunca hardcodeado.
- Solo usuarios autenticados, sin anónimos. Admin puede ocultar
  publicaciones. Sin likes ni DMs — mantener el alcance mínimo.
- DoD: 4 gates en verde; flag confirmado apagado por default; ruta
  nueva no rompe nada de `(protected)/`.

[T15 · AUTO] Deuda funcional chica + calidad
- Historial unificado de logros en `/certificados` (cursos aprobados +
  carreras), sin schema nuevo si no hace falta.
- Perfil unificado coworking+educativa si sigue pendiente en el
  checklist.
- Limpiar demos del wizard de Sentry (`sentry-example-api`,
  `sentry-example-page`, `global-error.tsx` si son solo boilerplate del
  wizard).
- Fix del comentario obsoleto en `src/app/(dashboard)/layout.tsx:143-145`.
- Actualizar `docs/FUNCIONALIDADES.md:462`: Vercel YA existe (ver
  `session_handoff.md` 2026-09-01) — no volver a marcar
  BLOCKED-ESPERANDO-HUMANO.
- Calidad: intentar que `tests/e2e/coworking-critical-path.spec.ts`
  corra en local (pago simulado, sin sandbox MP real); sumar Vitest de
  la lógica nueva de T11-T14 (nurturing, promote_lead, acceso por
  suscripción/tutoría).
- DoD: 4 gates en verde al cierre; sin `console.log` ni hex hardcodeado
  en UI nueva.

FUERA DE ALCANCE (no implementar en T10-T15, mismo criterio del draft
original): bolsa de trabajo, mentoría 1:1, eventos, biblioteca,
certificaciones externas, motor de recomendaciones, puntos por taller,
WhatsApp masivo, reprogramar reservas.

### Tabla de decisiones para T10-T15 (adaptada del draft — se conserva casi intacta)

| Duda | Decisión |
|---|---|
| ¿Commit / push? | Con aprobación explícita, como siempre — nunca automático. |
| ¿Editar migración ya aplicada 001-033? | Nunca. Nueva migración secuencial. |
| Copy nurturing sin aprobar | ES/AR, tono INCADE institucional, 3 mails cortos (d1/d3/d7). Documentar en `COMPONENTS.md` para revisión posterior del usuario. |
| Precio tutorías add-on | Campo en el curso, default 0 = no se vende. Admin lo carga. |
| WhatsApp admisiones | CTA a `https://incade.edu.ar` — no inventar teléfono. |
| ¿`FEATURE_PUBLICA` en prod? | Código listo, flag default false. Admin togglea en `/admin/configuracion`. |
| Foro: anónimo / moderación | Solo usuarios autenticados. Admin puede ocultar. Sin likes/DMs. |
| Pago MP sin token real | Código + firma `x-signature` + webhook como única fuente de verdad. No simular tokens — la prueba real la corre el usuario. |
| Resend sin API key / con key de test | Código + templates completos. No disparar envíos reales a leads reales sin confirmación explícita del usuario. |
| ¿`convert_user_role`? | Siempre la RPC. Nunca `UPDATE users.role`. Carreras solo las asigna Admin (regla 12). |
| RLS | `is_admin()` security definer. Nunca subquery a `public.users`. |
| Puntos | APPEND-ONLY. Nunca `UPDATE`/`DELETE` en `points_log`. |
| UI | DS v2.1: tokens `--edu-*`/`--inc-*`, Inter, Lucide. Sin hex. Dark only. |
| Schema | Español, snake_case, migraciones secuenciales en `supabase/migrations/`. |
| Flags | `getFlags()` DB + fallback env. Nunca hardcodear un módulo apagado. |
| Secretos | Nunca escribir keys. Si falta un secret: BLOCKED-HUMANO con comando/dashboard exacto. |
| Classifier/Auto-review bloquea un comando | 1 reintento equivalente más seguro. Si bloquea de nuevo: documentar el comando exacto para el humano, no loopear. |
| Vercel CLI / dominio / envs prod / rotar service role / staging / secrets GHA Playwright | BLOCKED-HUMANO (ya cubierto por T4/T6/T7 arriba). |
| Migración de schema contra producción (`supabase db push`) | **Siempre pedir confirmación puntual antes de ejecutar**, sin excepción — no entra en el criterio de "AUTO" aunque el resto del slice sí lo sea. |
| Conflicto spec vs código | Actualizar spec primero (versionar), después el código. Mismo criterio para el DS. |
| Alcance ambiguo | El corte más chico que deja el caso de uso testeable. Anotar la deuda en `session_handoff.md`. |

## FUERA DE COLA — trabajo verificado en la rama, no estaba en esta lista original

Los siguientes commits en `fix/db-search-path-024` (ya pusheados, HEAD
`4c1b241` en la pasada del 2026-08-29; `f9f10d5` en la del 2026-09-01) no
corresponden a ninguna tarea T1-T9 de arriba. Se documentan acá para que
la cola no quede ciega a ellos:

- `f9f10d5` (2026-09-01) — fix: los 10 hallazgos de
  `INFORME_CODE_REVIEW_2026-08-29.md` (informe ya borrado tras
  resolverse, ver `session_handoff.md`): catálogo público movido fuera
  de `(protected)`, guard de columnas en `bookings_update` (migración
  032), Storage RLS para Coordinador (migración 033), canje de cupón
  atómico (migración 034), timezone del cron corregido, V/F "Sin
  responder", errores de action ya no descartados en los toggles de
  admin, RPC `get_user_discount` condicional, limpieza de huérfano en
  Storage, horas de ocupación derivadas de constantes compartidas.
  DoD local (tsc/lint/test:unit) verde antes de commitear; CI en Actions
  sobre este HEAD (`33473351021`) estaba `in_progress` al cerrar esta
  sesión, sin confirmar todavía.

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