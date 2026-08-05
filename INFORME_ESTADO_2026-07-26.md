# INCADEducativa — Informe de Estado del Proyecto

> **Autor:** Auditoría técnica interna (rol Senior Developer)
> **Fecha:** 26 de julio de 2026
> **Alcance:** repositorio completo `incadeducativa/` en `main` (commit `0b6c800`)
> **Metodología:** revisión de código, migraciones SQL, documentación funcional (`docs/`), historial de commits, configuración de entorno y checklist de funcionalidades.
> **Referencias vivas del repo:**
> - [CLAUDE.md](CLAUDE.md) — fuente de verdad de reglas del proyecto (v3.5)
> - [docs/INCADEducativa_Spec_v3.md](docs/INCADEducativa_Spec_v3.md) — spec funcional
> - [docs/LIFECYCLE_PLAN.md](docs/LIFECYCLE_PLAN.md) — plan por sprints
> - [docs/FUNCIONALIDADES.md](docs/FUNCIONALIDADES.md) — checklist por rol (tablero de avance)
> - [docs/design/DESIGN_SYSTEM_INCADEducativa.md](docs/design/DESIGN_SYSTEM_INCADEducativa.md) — DS v2.1

---

## 1. Contexto del proyecto en 60 segundos

- **Stack ejecutado tal como se especificó:** Next.js 14 (App Router) + TypeScript + Supabase (Postgres + Auth + Storage + Realtime + RLS) + tRPC + MercadoPago SDK v2 + Resend + Twilio + React-PDF / qrcode + Playwright / Vitest.
- **Volumen actual:**
  - **196 archivos** `.ts/.tsx` bajo `src/`
  - **19 migraciones SQL** consecutivas (`001` → `019`) en [`supabase/migrations/`](supabase/migrations)
  - **6 sub-módulos** en el panel de admin: `carreras`, `cursos`, `coworking`, `talleres`, `usuarios`, `actions`
  - **7 módulos de dominio** en [`src/modules/`](src/modules): `admin`, `comunicacion`, `coworking`, `docente`, `educativa`, `talleres`, `tutorias`
  - **9 grupos de componentes** en [`src/components/`](src/components): `admin`, `auth`, `coordinador`, `courses`, `coworking`, `docente`, `educativa`, `layout`, `ui`
  - **2 crons internos** (`/api/cron/coworking`, `/api/cron/tutorias`) + 1 webhook MercadoPago con verificación de firma
- **Metodología usada:** **Spec-Driven Development real**, no cosmético. La spec, los 6 addenda, el `LIFECYCLE_PLAN` y `FUNCIONALIDADES.md` están sincronizados con el código — se ve en los commits (`Sprint 7a`, `Sprint 15-16`, `Sprint 19-20`, etc.) que respetan el plan.
- **Historia git:** 15 commits agrupados por sprint, mensajes descriptivos, un solo branch `main`. **No hay ramificación por PR ni CI corriendo** — todo se está haciendo local-first.

---

## 2. Veredicto ejecutivo

> **El proyecto está en un estado saludable de "MVP funcional avanzado" — mucho más maduro de lo que sugiere una versión `0.1.0`. Etapa 1 (Educativa) está prácticamente terminada; Etapa 2 (Coworking + Tutorías + Talleres) está aproximadamente al 85 %. Etapa 3 (público) no está iniciada, como estaba planeado. La calidad arquitectónica es alta para un equipo pequeño; el mayor riesgo hoy no es el código, es la ausencia de infraestructura productiva (CI/CD, monitoreo, gestión de secretos).**

**Nota agregada: 8.0 / 10.**

### Desglose por dimensión

- **Arquitectura y separación de capas — 9/10.** `src/app` (routing), `src/modules` (lógica de dominio), `src/components` (UI), `src/lib` (integraciones). Server Actions bien nombradas (`*Action.ts`). Modular.
- **Modelo de datos — 9/10.** 19 migraciones incrementales bien nombradas. RLS activo. Función `is_admin()` `security definer` usada correctamente (regla crítica #4). Ledger append-only respetado.
- **Design System — 10/10.** DS v2.1 con tokens `--inc-*` / `--edu-*`, cero hex hardcodeado, WCAG AA verificado con Lighthouse en 8 páginas (score 1.0). Ejemplar.
- **Seguridad de datos (RLS + webhooks) — 8/10.** RLS + `is_admin()`, verificación de firma `x-signature` en el webhook MP ([`src/app/api/mercadopago/webhook/route.ts`](src/app/api/mercadopago/webhook/route.ts)), re-consulta de pago a la API antes de tocar `bookings`. Impecable.
- **Feature flags — 9/10.** [`src/lib/flags.ts`](src/lib/flags.ts) por env vars, gating explícito. Regla crítica #6 respetada.
- **Testing — 6/10.** 1 E2E crítico + 2 unit suites (`gradeAttempt`, `auth-actions`). Cobertura de coworking en E2E: pendiente.
- **Infra / DevOps — 3/10.** Cero CI/CD, cero Vercel deploy, cero Sentry, sin PWA, sin GitHub Actions.
- **Gestión de secretos — 5/10.** `.env.local` versionado con `SUPABASE_SERVICE_ROLE_KEY` real — hay que verificar `.gitignore` y rotar la key si se subió al remoto (ver §7 Riesgos).
- **Documentación funcional — 10/10.** [`docs/FUNCIONALIDADES.md`](docs/FUNCIONALIDADES.md) es un checklist trazable línea por línea contra el código, con evidencias de QA en cada item. Mejor que muchos productos en producción.

---

## 3. Fortalezas arquitectónicas destacadas

1. **Un solo lenguaje de negocio en la DB.** Los nombres de tablas/columnas están en español (`preguntas`, `respuestas`, `puntos`, `carrera_id`) y la migración es fuente de verdad — no hay divergencia entre ORM y schema.
2. **Sin acoplamiento entre módulos.** Coworking, Tutorías y Talleres viven en sus propios `src/modules/*` con sus propias migraciones (002, 018, 019). Se pueden apagar con flags sin tocar Educativa.
3. **Webhook MP hecho por un adulto.** El route handler valida firma, re-consulta el pago a la API real, y sólo actualiza `bookings` con `.eq("estado","pendiente")` — idempotencia natural. Regla crítica #9 cumplida.
4. **Middleware de RBAC en una sola pieza.** [`src/middleware.ts`](src/middleware.ts) resuelve el gating de `/admin`, `/docente`, `/coordinador` con `can_teach` para rol dual. Simple, testeable, defensivo.
5. **Realtime bien empleado.** Notificaciones (`008`), ocupación coworking (`011`) y anuncios docente-alumno usan Supabase Realtime nativo — nada de polling ad-hoc.
6. **Regeneración de estados por cron dentro de la DB.** `detect_no_shows()` y `detect_completed_bookings()` (migración `016`/`017`) corren 100 % en SQL — cero dependencia de Node cuando basta con `pg_cron`.
7. **Ledger de puntos correcto.** `award_points()` como RPC, `points_log` append-only, canje de puntos por créditos de coworking (Sprint 19-20) implementado como una tabla aparte (`coworking_creditos_canje`), no como `UPDATE`.
8. **Separación clara entre revenue educativo y revenue coworking.** Vista `coworking_revenue` (migración 002) + panel `/admin/coworking/ingresos` independiente. Reservas institucionales (`tipo_descuento='institucional'`) y en lote no generan fila en `payments` — no contaminan métricas de negocio.
9. **Auto-registro acotado a Coworking respetando la regla crítica #2.** El único punto de entrada de un usuario `comunidad` sin `FEATURE_PUBLICA` es el flujo de reserva bajo `/servicios/coworking`, no hay `/registro` general.

---

## 4. Debilidades / deudas técnicas visibles hoy

1. **Ausencia total de CI/CD.** No hay `.github/workflows/`. `tsc --noEmit` y Playwright hoy corren manualmente. En cuanto haya dos personas commiteando, esto se rompe.
2. **`.env.local` con `SUPABASE_SERVICE_ROLE_KEY` real.** Aunque el `.gitignore` de Next probablemente lo excluye, hay que auditarlo **antes** de exponer el repo. Recomendación: rotar la service role key y mover secretos a Vercel/GitHub Secrets.
3. **Sin `SUPABASE_URL` de staging distinto.** Todo apunta a `wzquzbapcqesysreritu.supabase.co`. Producción y desarrollo comparten base.
4. **CRUD de usuarios incompleto.** Alta por CSV y conversión de rol OK; **editar** y **desactivar** un usuario existente sigue pendiente ([`docs/FUNCIONALIDADES.md` §2.1](docs/FUNCIONALIDADES.md)).
5. **Cobertura de tests desbalanceada.** El happy path educativo tiene un E2E sólido; los flujos críticos de coworking (reserva → pago → check-in → no-show) no tienen E2E — se validaron con scripts puntuales según registra la doc, no en un test automatizado.
6. **Materiales adjuntos por clase.** El schema `lessons` no tiene tabla para *attachments* extra sobre una clase de video. Es una decisión consciente pero es deuda funcional (§8.1).
7. **`window.confirm()` en cancelación de reservas.** Bloquea Playwright — hay que reemplazar por un `AlertDialog` de shadcn si querés E2E real (§2.2 de Funcionalidades explica el workaround actual).
8. **Sin PWA.** Está en el checklist (§9.2) pero no hay `manifest.json` ni service worker.
9. **Log de auditoría del sistema (§2.1) no existe.** Sólo hay `role_history`. Falta un log transversal de acciones del admin.
10. **Emails y WhatsApp dependen de configuración externa.** `RESEND_API_KEY` y `TWILIO_*` están vacíos en `.env.local`. Toda la lógica está lista, pero nunca se probó end-to-end contra un proveedor real.

---

## 5. Módulos implementados — inventario detallado

### 5.1. Etapa 1 — Educativa (casi completa, ~95 %)

- **Auth + roles + activación** — Completo. Superficie: `src/app/(auth)/`, [`src/middleware.ts`](src/middleware.ts), `updateSession` en [`src/lib/supabase/middleware.ts`](src/lib/supabase/middleware.ts).
- **Importación CSV de alumnos** — Completo. Modal con preview de duplicados + carrera sin match. Archivo: [`src/app/(dashboard)/admin/actions/importUsersActions.ts`](src/app/(dashboard)/admin/actions/importUsersActions.ts).
- **Conversión de rol aditiva** — Completo. Nunca borra historial, dispara notificación, registra en `role_history`. Archivo: [`src/app/(dashboard)/admin/actions/convertRoleActions.ts`](src/app/(dashboard)/admin/actions/convertRoleActions.ts) sobre la función SQL `convert_user_role()`.
- **CRUD Carreras / Cursos / Módulos / Clases** — Completo. Ruta admin: `/admin/carreras`, `/admin/cursos`. Componente clave: `CourseEditor` en `src/components/docente/CourseEditor.tsx` con `@dnd-kit`.
- **Cola de revisión + aprobar / rechazar con feedback** — Completo. Archivo: [`src/app/(dashboard)/admin/actions/reviewActions.ts`](src/app/(dashboard)/admin/actions/reviewActions.ts).
- **Player de clases + progreso** — Completo. `LessonPlayer`, tabla `lesson_progress`, trigger `trg_progress_recalc` (migración 001).
- **Motor de evaluaciones (5 tipos)** — Completo. Componentes: `EvaluationBuilder`, `QuestionBlock`. Corrección auto + manual con trigger `apply_manual_correction` (migración 003).
- **Entrega de TPs (archivo/Drive/GitHub/URL/texto)** — Completo. `TpFileUploader`, bucket `entregas-tp` (migración 009).
- **Certificados PDF + QR verificable** — Completo. [`src/lib/certificatePdf.tsx`](src/lib/certificatePdf.tsx), ruta pública `/verificar/[uuid]`, RPC `verify_certificate(uuid)` (regla crítica #5 respetada).
- **Sistema de puntos ledger append-only** — Completo. [`src/lib/points.ts`](src/lib/points.ts), triggers en migraciones 001/005, canje en Sprint 19-20.
- **Centro de notificaciones (Realtime)** — Completo. `NotificationBell`, `NotificationPanel`, migración 008. Tipos soportados: anuncio, tutoría, corrección, contenido publicado, certificado, puntos, pago, sistema.
- **Anuncios docente → grupo** — Completo. Realtime + email vía Resend, archivo [`src/app/(dashboard)/docente/actions/announcementActions.ts`](src/app/(dashboard)/docente/actions/announcementActions.ts).

### 5.2. Etapa 2 — Servicios (mayoritariamente lista, ~85 %)

- **Coworking — Landing pública y catálogo** — Completo. Ruta `/servicios/coworking` visible sin login (regla del middleware).
- **Coworking — Reserva pública + auto-registro mínimo** — Completo. `BookingForm`, `createBookingAction`. Excepción acotada de la regla crítica #2 aplicada correctamente (v3.5).
- **Coworking — Pago MercadoPago + webhook firmado** — Completo. [`src/app/api/mercadopago/webhook/route.ts`](src/app/api/mercadopago/webhook/route.ts) valida firma, re-consulta pago, es idempotente. **Nunca corrido con token real.**
- **Coworking — Panel admin completo** — Completo. 6 subrutas: `/admin/coworking/sedes`, `espacios`, `reservas`, `ocupacion`, `ingresos`, `membresias`.
- **Coworking — Membresías + suscripción MP recurrente** — Completo. Migración 015, `MembershipSubscribeForm`, `MembershipStatus` en `/dashboard`.
- **Coworking — Check-in QR + manual + no-show + auto-complete** — Completo. `CheckInScannerModal` con `html5-qrcode` + fallback manual. Detección de no-show por `pg_cron` cada 5 min. Auto-completar reservas vencidas por `detect_completed_bookings()`.
- **Coworking — Reservas en lote (Coordinador)** — Completo. Archivo: [`src/app/(dashboard)/coordinador/actions/batchBookingActions.ts`](src/app/(dashboard)/coordinador/actions/batchBookingActions.ts).
- **Coworking — Recordatorio 24hs + no-show por email** — Completo. Ruta interna `/api/cron/coworking`, protegida por `CRON_SECRET`.
- **Coworking — Canje de puntos por créditos** — Completo. `RedeemPointsCard` en dashboard, tabla `coworking_creditos_canje` (migración 017).
- **Tutorías** — Completo. Migración 018, `TutoriaModal`, `AsistenciaPanel`, `/api/cron/tutorias` para recordatorios 24hs y 1hs. Bloqueo automático de aula al agendar tutoría presencial.
- **Talleres (alcance interno)** — Completo. Migración 019, `TallerCard`, inscripción/desinscripción, sección "Disponibles" y "Mis talleres" en `/talleres`.

### 5.3. Etapa 3 — Público / Comunidad (no iniciada, 0 %)

Es lo esperable: los flags `FEATURE_PUBLICA` y `FEATURE_COMUNIDAD` están en `false` en [`.env.local`](.env.local). No hay código productivo asociado a esta etapa todavía.

---

## 6. Pendientes reales — todo lo que aún queda

### 6.1. Bloqueantes para poner en producción

- **Deploy Vercel + dominio `incadeducativa.com`.** No existe hoy.
- **GitHub Actions:** al menos lint + `tsc --noEmit` + Vitest + Playwright en cada PR.
- **Rotar `SUPABASE_SERVICE_ROLE_KEY`** y mover secretos a Vercel Env / GitHub Secrets. Confirmar que `.env.local` está en `.gitignore` y que la key no fue empujada al remoto.
- **Sentry** activado (variable `SENTRY_DSN` vacía hoy).
- **`RESEND_API_KEY` productiva.** Hoy vacía, por eso los emails de invitación dependen del SMTP default de Supabase.
- **`MP_ACCESS_TOKEN` productivo.** Todos los flujos de pago están verificados sólo con degradación graceful, nunca contra un token real.
- **`TWILIO_*` productivo** — si se decide activar WhatsApp en Etapa 2.

### 6.2. Deuda funcional priorizada (E1 / E2)

1. Editar / desactivar usuario (§2.1) — CRUD de usuarios incompleto.
2. Comunicado institucional masivo del Admin (§1.2).
3. Notificación de "contenido enviado a revisión" al admin (§1.2).
4. Notificación de "cambio de rol" al usuario convertido (§1.2).
5. Notificación de "TP corregido" al alumno vía in-app + email (§1.2).
6. Confirmación de inscripción a curso por email (§1.2).
7. Notificaciones al admin: nueva reserva, resumen diario 08:00, informe de tiempos ociosos lunes 09:00 (§1.2).
8. Export a PDF/Excel de reportes coworking (§2.2, hoy sólo CSV).
9. Análisis de ocupación gráfico y tiempos ociosos con recomendaciones (§2.2).
10. Incidencias de mantenimiento (schema listo en migración 002, UI faltante).
11. Editar nombre de certificado + regenerar PDF (§2.3, §8.2).
12. Certificado de especialización por carrera completada (§5.3, §8.2).
13. Mapa visual de carrera contra datos reales (§8.4 — hoy es un mock visual).
14. Materiales descargables adjuntos por clase (§8.1 — falta tabla en el schema).
15. Ver/descargar QR de reserva como botón explícito (§3.1, §5.2 — hoy solo visual).
16. Perfil de usuario (foto, área, historial unificado) (§1.1).
17. Habilitar/deshabilitar feature flags desde UI del Admin (§2.1).
18. Log de auditoría global del sistema (§2.1).
19. Descuentos y cupones aplicados automáticamente según rol (§1.3 de pagos).
20. Puntos por asistir a un taller (§5.5, hoy no otorga puntos).

### 6.3. Testing pendiente

- **E2E Etapa 2 (`coworking-flow.spec.ts`):** reserva → pago → check-in → no-show.
- **Unit tests** de: `get_user_discount`, `award_points`, `redeemPointsForCreditAction`, cron de recordatorios, verificación de firma MP.
- **Reemplazar `window.confirm()`** en cancelación por `AlertDialog` para desbloquear Playwright.

### 6.4. Etapa 3 completa (planificada, no iniciada)

- Catálogo público sin login (`FEATURE_PUBLICA`).
- Compra de cursos individuales / suscripción mensual.
- Foros por carrera / feed comunidad (`FEATURE_COMUNIDAD`).
- Registro de lead vía taller gratuito + nurturing D1/D3/D7.
- Conversión automática lead → comunidad al primer pago (CU-T03, ADR-16).
- Analítica de funnel visitante → lead → comunidad → alumno.

### 6.5. Operaciones (§9.2)

- PWA instalable (manifest + service worker).
- Preview automático por PR.
- Vercel Analytics.
- Deploy con GitHub Actions (CI/CD).

---

## 7. Riesgos que exigen decisión de negocio, no sólo técnica

1. **Deployment a producción.** El código está listo, la infraestructura no. Se necesita 1 sprint dedicado sólo a Vercel + GitHub Actions + Sentry + rotación de secretos antes de exponer nada al público.
2. **Datos reales de INCADE.** Va a haber que importar el CSV real de alumnos y probablemente iterar el schema de `carrera_id`. Hoy hay una función `convert_user_role()` sólida, pero no hay dry-run ni sandbox de importación.
3. **Cobros reales de Coworking (Etapa 2).** El webhook está listo pero nunca corrió con un token productivo. Es el mayor "unknown unknown" técnico del proyecto.
4. **Escalabilidad de Storage.** Videos de clases en Supabase Storage con URL firmada. Límite práctico ~500 MB/video según el plan actual. Funciona para MVP; para 100+ cursos habrá que revisar hosting alternativo (Mux, Cloudflare Stream, Bunny).
5. **Seguridad de secretos.** Si `.env.local` fue commiteado al remoto en algún momento (aún si hoy está fuera), la `SUPABASE_SERVICE_ROLE_KEY` ya está comprometida y debe rotarse. Auditar el histórico de git con `git log --all --full-history -- .env*`.
6. **DB única para dev y prod.** Todo apunta a la misma instancia de Supabase. Es aceptable en pre-launch, es inaceptable con usuarios reales.
7. **Dependencia de `pg_cron` + `pg_net`.** Las notificaciones automáticas dependen de que ambos extensions estén habilitados y de que el endpoint interno sea alcanzable desde Supabase. En `localhost` no funciona — sólo se puede validar end-to-end en Vercel deployado.

---

## 8. Recomendación de próximos pasos (orden de ejecución)

1. **Cerrar infraestructura productiva** antes de tocar más features:
   - Vercel + dominio + envs por ambiente (`production`, `preview`, `development`).
   - GitHub Actions con lint + `tsc --noEmit` + Vitest + Playwright.
   - Sentry con `SENTRY_DSN` productivo.
   - Rotación de `SUPABASE_SERVICE_ROLE_KEY` y auditoría del historial git.
   - Instancia Supabase de staging separada.
2. **E2E de Coworking** para dormir tranquilos con el flujo de pago (webhook real de MP, check-in, no-show).
3. **Cerrar deuda de notificaciones y CRUD de usuarios** — son items pequeños que cierran §1.2 y §2.1 rápido y elevan la percepción de "producto terminado".
4. **QA con usuarios reales** en Beta INCADE (hito del `LIFECYCLE_PLAN.md`: 20 alumnos reales completando al menos 1 módulo).
5. **Ir a Etapa 3** sólo cuando E1 + E2 estén en producción con tráfico real y métricas validadas.

---

## 9. Anexo — inventario técnico rápido

### 9.1. Migraciones SQL (19)

- `001_educativa_core.sql` — 20 KB · core educativo (13 tablas + RLS)
- `002_coworking_module.sql` — 12 KB · coworking (E2)
- `003_motor_evaluaciones_comunicacion.sql` — 13 KB · +5 tablas
- `004_conversion_roles.sql` — 6 KB · rol lead, `can_teach`
- `005_rls_fixes_e1.sql` — 5 KB · fixes RLS + ledger + constraints
- `006_lesson_storage.sql` — 2 KB · bucket `contenido-cursos`
- `007_course_review.sql` — 2 KB · flujo de curación
- `008_notifications_realtime.sql` — 683 B · Realtime notifications
- `009_certificates_storage.sql` — 2 KB · buckets `certificados` + `entregas-tp`
- `010_coworking_public_read.sql` — 1 KB · lectura pública del catálogo
- `011_coworking_realtime.sql` — 641 B · Realtime bookings
- `012_booking_contact_phone.sql` — 901 B · `telefono_contacto` en `bookings`
- `013_space_availability.sql` — 2 KB · vistas de disponibilidad
- `014_notification_type_reserva.sql` — 635 B · tipo `reserva`
- `015_membership_plans.sql` — 3 KB · planes de membresía
- `016_coworking_reminders.sql` — 2 KB · `detect_no_shows()` + `pg_cron`
- `017_coworking_credits.sql` — 1 KB · `coworking_creditos_canje` + `detect_completed_bookings()`
- `018_tutorias.sql` — 5 KB · módulo tutorías
- `019_talleres.sql` — 4 KB · módulo talleres

### 9.2. Historial de sprints (git)

- `12c340b` — `docs: resolución total pre-desarrollo — spec v3.4 coherente`
- `7c15cc1` — `feat: scaffold Next.js 14 + Design System v2.1 foundation`
- `8a5c5aa` — `Sprint 1a`
- `b24e8a9` — `adm de roles y catalogo de cursos`
- `23b2b43` — `Sprint 5 y 6, quedo pendiente prueba subida mp4`
- `b1b03b8` — `Sprint 7a: panel docente, editor de estructura y cola de revision`
- `9ba7ec3` — `Sprint 7b-13: evaluaciones, certificados, puntos y modulo Coworking completo`
- `3359ae5` — `Sprint 15-16: panel admin de Coworking - ocupacion, reservas, check-in e ingresos`
- `5b2d73a` — `Sprint 17-18: membresias, suscripcion MP, coordinador y notificaciones reales`
- `060d146` — `sprint 19 20 y 017 migración pendiente`
- `12500cf` — `Sprint 19-20: consumo de creditos canjeados + auto-completar reservas`
- `48e7858` — `Sprint Tutorias (Addendum 05): modulo completo, spec-first`
- `e2a7712` — `Sprint Talleres (Addendum 06): modulo interno E2, spec-first`
- `a1d8ec0` — `QA Etapa 1: E2E camino critico (Playwright) + unit tests gradeAttempt`
- `0b6c800` — `QA Etapa 1: auditoria Lighthouse (accesibilidad WCAG AA) + Design System v2.2`

### 9.3. Feature flags actuales (`.env.local`)

- `FEATURE_EDUCATIVA=true` — E1 producto central
- `FEATURE_COWORKING=true` — E2 servicio con revenue propio
- `FEATURE_TUTORIAS=true` — E2 addendum 05
- `FEATURE_TALLERES=true` — E2 addendum 06 (alcance interno)
- `FEATURE_COMUNIDAD=false` — E3
- `FEATURE_PUBLICA=false` — E3

### 9.4. Tests presentes

- `tests/e2e/critical-path.spec.ts` — camino crítico Etapa 1 (Playwright)
- `tests/unit/gradeAttempt.test.ts` — corrección automática de los 5 tipos de pregunta (Vitest)
- `tests/unit/auth-actions.test.ts` — acciones de auth (Vitest)
- `tests/e2e/supabaseTestClient.ts` — helper de fixture

### 9.5. Rutas API

- `POST /api/mercadopago/webhook` — única fuente de verdad del estado de pago (firma verificada).
- `GET /api/cron/coworking` — protegido por `CRON_SECRET`. Recordatorios 24hs + notificación de no-show + auto-complete de reservas vencidas.
- `GET /api/cron/tutorias` — protegido por `CRON_SECRET`. Recordatorios 24hs y 1hs.

---

## 10. Cierre

INCADEducativa no es un prototipo — es una plataforma casi lista para producción con dos etapas completas en el 80–95 % y una tercera correctamente diferida. La brecha entre "listo" y "en producción con usuarios reales" no es de código: es de **infraestructura, cobertura de tests de flujos de pago y cierre de tareas pequeñas de UX administrativa**. Un sprint focalizado en DevOps + un sprint focalizado en cerrar la deuda de §6.2 dejaría el producto en condiciones de lanzamiento Beta INCADE.

La solidez del `LIFECYCLE_PLAN.md`, la trazabilidad de `FUNCIONALIDADES.md` contra el código y el respeto disciplinado a las reglas críticas de `CLAUDE.md` son señales muy poco frecuentes en un proyecto de esta escala. Es una base sana para escalar.

---

*Informe generado el 26-jul-2026 · commit de referencia `0b6c800` · rama `main`*
