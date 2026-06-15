# INCADEducativa — Plan de Ciclo de Vida de Desarrollo
## Development Lifecycle Plan v1.3

> Basado en Spec v3.4 (Conversión de Roles + Motor de Evaluaciones + Comunicación + Coworking Independiente) | Metodología: Spec-Driven Development (SDD) + Agile Sprints  
> Stack: Next.js 14 · Supabase · MercadoPago · Vercel

---

## Resumen ejecutivo del plan

| Etapa | Duración | Foco | Estado |
|-------|----------|------|--------|
| **Setup** | Semana 0 | Infraestructura, repositorio, CI/CD | 🔴 Por iniciar |
| **Etapa 1** | Semanas 1–10 | MVP Educativo completo | 🔴 Por iniciar |
| **Etapa 2** | Semanas 11–20 | Módulo Coworking | ⏸ Planificada |
| **Etapa 3** | Semanas 21+ | Apertura pública | ⏸ Planificada |

---

## FASE 0A — Design Foundation (Semana 0 · primeros 2–3 días)

> Ejecutar ANTES de crear-next-app. El código no comienza sin la base visual lista.

### Objetivos
- Documentación v3.4 sincronizada y sin divergencias
- Design System aplicado en Tailwind + shadcn antes del primer componente
- Shell de la aplicación (layouts vacíos) con identidad visual correcta
- Página `/design-preview` que sirve como QA visual de tokens

### Checklist de Design Foundation
- [ ] Leer `docs/design/DESIGN_SYSTEM_INCADEducativa.md` v2.0 completo
- [ ] Leer `docs/design/SHADCN_THEME.md` — mapeo tokens → shadcn
- [ ] Leer `docs/design/COMPONENTS.md` — catálogo mínimo E1
- [ ] Verificar que el mockup v4 (`docs/mockups/INCADEducativa_Mockup_v4.html`) refleja el DS v2.0
- [ ] Inicializar Next.js (ver PRIMEROS_PASOS.md Paso 1)
- [ ] Configurar `globals.css` con variables DS §5 + mapeo SHADCN_THEME
- [ ] Configurar `tailwind.config.ts` del DS §5
- [ ] Ejecutar `npx shadcn@latest init` con `cssVariables: true`
- [ ] Verificar: `npm run dev` muestra fondo `#08080F`, Inter cargada desde Google Fonts
- [ ] Crear shell components sin lógica: `AuthLayout`, `DashboardLayout`, `Sidebar`, `Topbar`
- [ ] Crear `/design-preview` con muestra de Button (3 variantes), Card, Badge, Input, Progress
- [ ] QA visual: verificar contraste WCAG AA en texto principal y CTAs (Lighthouse)
- [ ] PR `docs-v3.4-design` — tag `v0.0.1-design-foundation`

### Definición de "listo" (DoD) de Fase 0A
- `npm run dev` muestra fondo `#08080F`, Inter, violeta `#9B30FF` en elementos primarios
- `/design-preview` muestra todos los componentes base sin colores hardcodeados
- Contraste WCAG AA verificado en texto principal y botón primario
- Ningún archivo de código contiene `#8B3FE8` ni `#0A0A14` ni fuentes del sistema como primaria

---

## FASE 0B — Setup (Semana 0 · continuación)

### Objetivos
- Repositorio configurado y funcional
- CI/CD operativo con preview automático por PR
- Dominio `incadeducativa.com` activo en Vercel
- Supabase proyecto creado con schema Etapa 1 aplicado
- Variables de entorno configuradas en todos los ambientes
- CLAUDE.md en raíz del repo, leído y validado por el equipo

### Checklist de setup
- [ ] Crear repositorio GitHub: `incadeducativa`
- [ ] Inicializar Next.js 14: `npx create-next-app@latest --typescript --tailwind --app`
- [ ] Instalar dependencias core: `shadcn/ui`, `tRPC`, `@supabase/supabase-js`, `resend`, `qrcode`, `lucide-react`
- [ ] Aplicar Design Foundation: `globals.css` + `tailwind.config.ts` del DS §5 + shadcn tematizado
- [ ] Crear proyecto Supabase → ejecutar las migraciones E1 **en orden: `001` → `003` → `004` → `005`** (18 tablas + fixes de RLS). NO ejecutar `002` (es E2, solo con `FEATURE_COWORKING`)
  ```
  Orden de migraciones:
  E1: 001_educativa_core → 003_motor_evaluaciones_comunicacion → 004_conversion_roles → 005_rls_fixes_e1
  E2: 002_coworking_module (solo al activar FEATURE_COWORKING)
  ```
- [ ] Configurar Vercel: dominio `incadeducativa.com`, env vars prod/preview/dev
- [ ] Configurar GitHub Actions: lint + test en cada PR
- [ ] Configurar Sentry para monitoreo de errores
- [ ] `FEATURE_EDUCATIVA=true` en `.env.local` y en Vercel (Etapa 1 activa)
- [ ] Primera release tag: `v0.1.0-setup`

### Variables de entorno mínimas
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=https://incadeducativa.com

# Feature flags (Etapa 1)
FEATURE_EDUCATIVA=true
FEATURE_COWORKING=false
FEATURE_TALLERES=false
FEATURE_TUTORIAS=false
FEATURE_COMUNIDAD=false
FEATURE_PUBLICA=false

# Email
RESEND_API_KEY=

# IA (opcional Etapa 1)
ANTHROPIC_API_KEY=
```

### Definición de "listo" (DoD — Definition of Done) del Setup
- `npm run dev` funciona sin errores
- `npm run build` pasa sin errores TypeScript
- Preview URL activa en Vercel para cada PR
- Schema de DB aplicado y verificado en Supabase Dashboard (18 tablas E1, tras 001+003+004+005)
- Al menos 1 admin user creado manualmente en Supabase Auth
- Design Foundation aplicado: `#08080F` como fondo, Inter cargada, `/design-preview` funcional

---

## ETAPA 1 — MVP Educativo (Semanas 1–10)

### Sprint 1–2: Estructura base + Auth + Roles

**Objetivo:** La plataforma tiene estructura, un admin puede hacer login y ver el dashboard básico.

#### Tareas técnicas
- [ ] Estructura de carpetas App Router: `(auth)/`, `(dashboard)/`, `api/`
- [ ] Conectar shell existente (AuthLayout, DashboardLayout, Sidebar, Topbar) a Supabase Auth
- [ ] Configurar Supabase Auth: magic link + email/password
- [ ] Middleware de protección de rutas por rol
- [ ] Sidebar dinámico por rol usando tokens DS (Admin, Docente, Alumno)
- [ ] Flujo de importación CSV de alumnos (Admin)
  - Parsear CSV: DNI, nombre, apellido, email, carrera
  - Crear usuarios en Supabase Auth con `inviteUserByEmail`
  - Crear registro en `public.users` con rol `alumno`
  - Email de activación automático vía Resend
- [ ] Panel Admin: vista básica de usuarios importados
- [ ] Flujo de activación de cuenta para alumno (magic link → set password → onboarding)
- [ ] Conversión de rol (Addendum 04): `convertUserRoleAction` sobre la función `convert_user_role()` + botón "Convertir a Alumno INCADE" (DNI + carrera) en el perfil de usuario del panel Admin
- [ ] Habilitar `can_teach` a un alumno y asignarle cursos (rol dual docente) desde el panel Admin
- [ ] Mostrar `role_history` en el detalle del usuario (auditoría de conversiones)

#### Componentes a crear
- `AuthLayout` — wrapper de páginas de auth
- `DashboardLayout` — sidebar + topbar + content area
- `Sidebar` — navegación por rol (considera rol dual alumno + can_teach)
- `UserAvatar` — avatar con iniciales + puntos
- `ImportCsvModal` — upload y preview de CSV
- `ActivationForm` — formulario de activación de cuenta
- `ConvertRoleModal` — conversión de rol con asignación de DNI + carrera (Admin)
- `RoleHistoryTimeline` — historial de conversiones del usuario

#### Tests E2E (Playwright)
- [ ] `auth/login.spec.ts` — login con email/password
- [ ] `auth/activation.spec.ts` — flujo completo de activación
- [ ] `admin/import-csv.spec.ts` — importación de 10 alumnos
- [ ] `admin/convert-role.spec.ts` — CU-T04: convertir comunidad → alumno, verificar historial preservado + notificación

#### Criterio de aceptación del sprint
El Admin puede importar un CSV de 50 alumnos. Cada alumno recibe el email de activación. El alumno puede activar su cuenta en menos de 3 pasos. El Admin convierte un usuario existente a Alumno INCADE sin pérdida de historial y el cambio queda en `role_history`.

---

### Sprint 3–4: Catálogo de cursos + Inscripción

**Objetivo:** El alumno puede ver cursos disponibles, inscribirse y comenzar la primera clase.

#### Tareas técnicas
- [ ] CRUD de Carreras (Admin): crear, editar, activar/desactivar
- [ ] CRUD de Cursos (Admin + Docente): crear, asignar docente, configurar
- [ ] Catálogo de cursos con filtros: por carrera, nivel, estado
- [ ] Página de detalle de curso: descripción, módulos, docente, inscripción
- [ ] Acción de inscripción: `enrollUserAction.ts` (en E1 **solo cursos gratuitos**, incluso fuera de la carrera del alumno — CU-T01; el flujo de cobro de cursos es Etapa 3)
- [ ] Página de carrera con acceso por rol: `alumno` ve inscripción; `comunidad`/`lead`/visitante ven vitrina + CTA a admisiones (CU-T02, ADR-15)
- [ ] Dashboard del alumno: cursos activos con progreso
- [ ] Rutas: `/cursos`, `/cursos/[slug]`, `/carreras`, `/carreras/[slug]`

#### Componentes a crear
- `CourseCard` — card de curso con progreso y estado
- `CareerMap` — mapa visual de carrera con cursos
- `CourseDetail` — página completa de un curso
- `EnrollButton` — CTA de inscripción con estado
- `CareerBlockedCTA` — bloque para roles no elegibles a carreras: "Esta carrera requiere matrícula presencial" + CTA admisiones/WhatsApp (copy del Addendum 04 §7)
- `ProgressBar` — barra de progreso reutilizable
- `FilterBar` — filtros de catálogo

#### Tests E2E
- [ ] `courses/catalog.spec.ts` — navegar catálogo, filtrar
- [ ] `courses/enroll.spec.ts` — CU-01 parcial: inscripción
- [ ] `careers/blocked-cta.spec.ts` — CU-T02: usuario comunidad ve CTA a admisiones, no botón de compra

#### Criterio de aceptación del sprint
Alumno descubre un curso, se inscribe y ve la confirmación en su dashboard. Todo en menos de 3 clics desde el dashboard.

---

### Sprint 5–6: Player de contenido + Progreso

**Objetivo:** El alumno puede completar clases, su progreso se guarda y la barra se actualiza en tiempo real.

#### Tareas técnicas
- [ ] Estructura de módulos y lecciones dentro de un curso
- [ ] Player de video (HTML5 + Supabase Storage URL firmada)
- [ ] Viewer de contenido texto/documento
- [ ] Registro de progreso cada 10 segundos (debounced save)
- [ ] Reanudación desde el último punto (bookmark)
- [ ] Navegación entre lecciones: anterior / siguiente / sidebar del curso
- [ ] Marcado de lección como completada
- [ ] Recálculo automático de `progreso_pct` en enrollment (trigger DB)
- [ ] Rutas: `/cursos/[slug]/lecciones/[id]`

#### Componentes a crear
- `LessonPlayer` — player de video con progress tracking
- `ContentViewer` — viewer de texto/documento
- `LessonSidebar` — lista de módulos y lecciones con estado
- `LessonNav` — anterior / siguiente
- `CompletionBadge` — badge animado al completar lección

#### Tests E2E
- [ ] `lessons/player.spec.ts` — CU-01 completo: ver clase, progreso, completar
- [ ] `lessons/resume.spec.ts` — abandonar y reanudar desde el mismo punto

#### Criterio de aceptación del sprint
El progreso se persiste correctamente. Si el alumno abandona a los 2:30 de un video de 5 minutos, al volver reanuda desde los 2:30. La barra de progreso del curso se actualiza sin recargar la página.

---

### Sprint 7–8: Panel docente + Revisión + Editor de Evaluaciones + Comunicación

**Objetivo:** Docente carga un curso completo, arma evaluaciones con el editor visual y comunica anuncios al grupo. El Admin aprueba en 1 clic. El alumno recibe notificaciones in-app.

#### Tareas técnicas — Contenido y revisión
- [ ] Panel del docente: mis cursos asignados, estadísticas básicas
- [ ] Editor de estructura de curso: crear módulos y lecciones, reordenar con drag
- [ ] Upload de videos a Supabase Storage con progress bar
- [ ] Upload de documentos (PDF, PPT)
- [ ] Estado del curso: borrador → en revisión → publicado
- [ ] Acción "Enviar a revisión" del docente
- [ ] Cola de revisión en el panel Admin: cursos pendientes
- [ ] Acciones Admin: aprobar con 1 clic / rechazar con comentario
- [ ] Log de auditoría básico para el Admin

#### Tareas técnicas — Editor de Evaluaciones (Addendum 01)
- [ ] Editor visual por bloques con menú de tipos de pregunta (íconos Lucide)
- [ ] 5 tipos: V/F con fundamentación, opción única, opción múltiple, abierta, entrega TP
- [ ] Reordenar preguntas con drag & drop, configurar peso y respuesta correcta
- [ ] Configuración global: tiempo límite, nota mínima, intentos, espera, resultado inmediato/diferido
- [ ] Persistir en `evaluations.config` y `evaluations.preguntas (jsonb)`

#### Tareas técnicas — Comunicación (Addendum 02)
- [ ] Tabla `notifications` + canal in-app vía Supabase Realtime
- [ ] Centro de notificaciones: campana con badge, panel, marcar leídas, navegación al recurso
- [ ] Preferencias de notificación por usuario (email/WhatsApp, in-app siempre activo)
- [ ] Canal de anuncios del docente: nuevo anuncio (texto + adjunto), historial del curso
- [ ] Envío de anuncio dispara `notifications` (in-app) + email (Resend) a inscriptos
- [ ] Notificaciones email (Resend): al docente cuando Admin aprueba/rechaza

#### Componentes a crear
- `CourseEditor` — editor completo de estructura del curso
- `LessonUploader` — upload de video con barra de progreso
- `ReviewQueue` / `ReviewActions` — cola y acciones de revisión (Admin)
- `EvaluationBuilder` — editor visual de evaluaciones por bloques
- `QuestionBlock` — bloque de pregunta por tipo (5 variantes)
- `NotificationBell` — campana + badge en topbar (Realtime)
- `NotificationPanel` — panel de notificaciones con estados leída/no leída
- `AnnouncementComposer` — redacción y envío de anuncios al grupo
- `AnnouncementList` — historial de anuncios del curso

#### Tests E2E
- [ ] `docente/upload.spec.ts` — CU-02: subir contenido y enviar a revisión
- [ ] `admin/review.spec.ts` — aprobar y rechazar curso
- [ ] `docente/evaluation-builder.spec.ts` — CU-04: armar evaluación con 5 tipos
- [ ] `docente/announcement.spec.ts` — CU-05: enviar anuncio → notificación in-app + email

#### Criterio de aceptación del sprint
Admin aprueba/rechaza sin entrar al editor. Docente arma una pregunta en < 3 clics. Un anuncio genera notificación in-app en < 5s y email en < 60s.

---

### Sprint 9–10: Motor de Evaluaciones completo + Certificados + Puntos + QA final

**Objetivo:** El alumno rinde y entrega evaluaciones (5 tipos), el docente corrige manualmente, el alumno obtiene certificado con QR verificable. Sistema de puntos operativo. Plataforma lista para producción.

#### Tareas técnicas — Motor de Evaluaciones (rendir + corregir, Addendum 01)
- [ ] Render de evaluación por tipo: cuestionario de módulo y examen final (temporizador opcional)
- [ ] Resolución de los 5 tipos de pregunta (V/F+fundamentación, única, múltiple, abierta, TP)
- [ ] Corrección automática de opción única/múltiple → `score_auto`
- [ ] Entrega de TP: upload de archivo, link Drive/GitHub, URL externa o texto (`evaluation_submissions`)
- [ ] Máquina de estados del intento: bloqueada → disponible → en_curso → pendiente_correccion → aprobada/desaprobada/corregida
- [ ] Panel de correcciones del docente: cargar `nota_parcial` + devolución (`manual_corrections`)
- [ ] Integración score auto + manual (trigger `apply_manual_correction`) y notificación al alumno
- [ ] Panel de resultados por evaluación + export CSV
- [ ] Reintento según intentos y espera configurados (nota mínima 60%)

#### Tareas técnicas — Certificados + Puntos
- [ ] Generación de certificado PDF (React-PDF o Puppeteer server-side)
- [ ] QR único por certificado (`uuid_verificacion`)
- [ ] Página pública de verificación: `/verificar/[uuid]` (sin login)
- [ ] Sección "Mis certificados" del alumno: lista + descarga
- [ ] Sistema de puntos: reglas configurables por Admin
  - Completar lección: +10 pts
  - Aprobar evaluación: +25 pts
  - Obtener certificado: +100 pts
- [ ] Historial de puntos visible para el alumno
- [ ] Testing E2E completo de todos los flujos críticos
- [ ] Performance: Lighthouse score > 85 en mobile
- [ ] Accessibility: no errores WCAG AA críticos
- [ ] Deploy a producción: `v1.0.0`

#### Componentes a crear
- `EvaluationPlayer` — render y resolución de evaluación con timer y feedback
- `SubmissionUploader` — entrega de TP (archivo/Drive/GitHub/URL/texto)
- `CorrectionPanel` — corrección manual del docente con nota parcial + devolución
- `EvaluationResults` — panel de resultados + export CSV
- `CertificateCard` — card del certificado con QR y descarga
- `CertificateVerifier` — página pública de verificación
- `PointsHistory` / `PointsBadge` — historial y badge de puntos

#### Tests E2E
- [ ] `evaluations/quiz.spec.ts` — cuestionario auto: aprobar y reprobar
- [ ] `evaluations/tp-submission.spec.ts` — entregar TP y corrección manual del docente
- [ ] `certificates/generate.spec.ts` — CU-03: obtener certificado
- [ ] `certificates/verify.spec.ts` — verificación pública sin login
- [ ] `points/accumulate.spec.ts` — acumulación automática de puntos

#### Criterio de aceptación del sprint (= criterio de lanzamiento)
- La corrección manual actualiza la nota total en tiempo real y notifica al alumno
- Certificado se genera en < 10 segundos
- QR de verificación funciona sin login
- 0 errores críticos en Playwright E2E suite
- 100 alumnos de prueba importados y con al menos 1 curso completado
- Deploy a `incadeducativa.com` funcional

---

## ETAPA 2 — Módulo Coworking · servicio independiente (Semanas 11–20)

> El Coworking es un servicio con revenue propio, abierto a la comunidad desde E2 (Addendum 03, ADR-13). Acceso público sin esperar a E3.

### Pre-requisito
`FEATURE_COWORKING=true` habilitado en `.env.production`  
Migración `002_coworking_module.sql` ejecutada en Supabase

### Sprint 11–12: Arquitectura del módulo + acceso público
- [ ] Activar feature flag y estructura de rutas `/servicios/coworking`
- [ ] Ejecutar migración 002 (locations, spaces, bookings con `tipo_descuento`, payments, memberships, checkins)
- [ ] Seed: cargar 2 sedes INCADE con sus espacios reales
- [ ] Landing pública de Coworking visible SIN login: espacios, fotos, capacidad, servicios, precios
- [ ] UI base del módulo: selector de sede, catálogo de espacios
- [ ] Tabla de perfiles de acceso (alumno/docente/coordinador/comunidad/lead/admin) implementada
- [ ] Descuento institucional automático por rol vía `get_user_discount()` (alumno/docente/coordinador)
- [ ] Registro mínimo (nombre + email + contraseña) para usuarios sin cuenta antes de pagar

### Sprint 13–14: Reservas + Pagos MercadoPago
- [ ] Calendario de disponibilidad en tiempo real (Supabase Realtime)
- [ ] Flujo de reserva público: seleccionar espacio → fecha/hora → registro → confirmar (CU-06, < 5 pasos)
- [ ] Integración MercadoPago: crear preference, checkout, webhook (única fuente de verdad)
- [ ] Marcado de `tipo_descuento` en cada reserva (institucional / publico / manual)
- [ ] Generación de QR de reserva post-pago
- [ ] Email + WhatsApp de confirmación (Resend + Twilio)
- [ ] Constraint de no-overlap en DB (ya incluido en migración 002)

### Sprint 15–16: Panel Admin Coworking + Ingresos separados
- [ ] Dashboard de ocupación en tiempo real por sede
- [ ] Gestión de espacios: CRUD, precios, horarios, fotos
- [ ] Gestión de reservas: vista del día, cancelaciones
- [ ] Reservas manuales del admin sin pago online (`tipo_descuento = manual`)
- [ ] Bloqueo automático de aula al agendar tutoría presencial (uso institucional)
- [ ] Check-in QR + check-in manual ("Presente") desde el panel admin (mobile-first)
- [ ] **Panel de ingresos independiente** (vista `coworking_revenue`): por período, sede y tipo de usuario; export CSV
- [ ] Reportes básicos: ocupación semanal, ingresos institucional vs público

### Sprint 17–18: Membresías + Notificaciones
- [ ] Planes de membresía: mensual / anual con créditos
- [ ] Flujo de suscripción con MercadoPago (pago recurrente)
- [ ] Notificaciones automáticas: recordatorio 24hs antes, no-show a los 15 min
- [ ] Reservas en lote para coordinadores (N semanas consecutivas)

### Sprint 19–20: Integración completa + QA
- [ ] Canje de puntos de la plataforma educativa por horas de coworking
- [ ] QA end-to-end: flujo reserva → pago → check-in → completado
- [ ] 0 errores de doble asignación de espacio
- [ ] Deploy Etapa 2: `v2.0.0`

---

## ETAPA 3 — Apertura pública (Semanas 21+)

### Hitos principales
- [ ] `FEATURE_PUBLICA=true`: catálogo público sin login
- [ ] `FEATURE_COMUNIDAD=true`: foros por carrera, feed institucional
- [ ] Landing page de conversión en `incadeducativa.com` (SEO optimizada)
- [ ] Registro libre de usuarios externos con suscripción mensual
- [ ] Transición automática `lead` → `comunidad` al confirmarse el pago del primer curso (webhook MP `payment.approved` → `convert_user_role()`, CU-T03)
- [ ] Notificación de bienvenida a la comunidad post-conversión + transferencia de puntos del taller gratuito
- [ ] Integración con email marketing (Mailchimp o Brevo)
- [ ] Analítica avanzada: funnel visitante → lead → comunidad → alumno → egresado
- [ ] Deploy Etapa 3: `v3.0.0`

---

## Definition of Done (DoD) — aplica a todos los sprints

Una historia o tarea se considera DONE cuando:
1. ✅ Código en `main` branch sin errores TypeScript (`tsc --noEmit` pasa)
2. ✅ Tests Playwright para el flujo crítico pasan en CI
3. ✅ Tests Vitest para la lógica de negocio pasan
4. ✅ RLS policies verificadas en Supabase para el feature
5. ✅ Cumple Design System v2.0 (tokens --edu-* e --inc-*, Inter, Lucide, radios, estados semánticos)
6. ✅ Mobile responsive (breakpoints Tailwind)
7. ✅ Preview URL en Vercel funcional para revisión del cliente
8. ✅ No hay `console.log` en producción (linted)
9. ✅ Sentry no reporta errores nuevos en preview

---

## Hitos de lanzamiento

| Hito | Target | Métrica de éxito |
|------|--------|-----------------|
| **Alpha interno** | Semana 6 | Admin + 5 alumnos de prueba usando la plataforma |
| **Beta INCADE** | Semana 9 | 20 alumnos reales completando al menos 1 módulo |
| **Launch Etapa 1** | Semana 10 | 100 alumnos activos en 30 días post-lanzamiento |
| **Launch Etapa 2** | Semana 20 | 30% de alumnos activos usando coworking en 60 días |
| **Launch Etapa 3** | Semana 27+ | 50 usuarios externos registrados en el primer mes |

---

## Gestión de riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| INCADE no tiene los datos de alumnos en formato CSV limpio | Alta | Alto | Definir formato CSV y hacer limpieza en semana 0 |
| Docentes no tienen familiaridad con herramientas digitales | Media | Medio | Tutorial en video del panel docente + soporte en primeras semanas |
| Videos de cursos muy pesados para Supabase Storage | Media | Medio | Límite de 500MB por video, guía de compresión para docentes |
| MercadoPago webhook en producción falla | Baja | Alto | Implementar cola de retry y log de webhooks desde el inicio |
| Supabase RLS mal configurado expone datos | Baja | Crítico | Code review de cada policy + tests de seguridad en CI |

---

*Plan generado: Junio 2026*  
*Escobar, José Gustavo · Schwegler, Alan · INCADEducativa*
