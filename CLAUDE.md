# CLAUDE.md — INCADEducativa
> Fuente de verdad para Cursor + Claude Code CLI. Leer antes de escribir cualquier línea de código.
> Versión: 3.5 — excepción de auto-registro acotada a Coworking (regla #2, Sprint 13-14)

## Proyecto
INCADEducativa — Plataforma Educativa Digital · incadeducativa.com
Cliente: Escuela de Negocios INCADE · Posadas, Misiones, Argentina
Spec de referencia: docs/INCADEducativa_Spec_v3.md
Checklist de funcionalidades: docs/FUNCIONALIDADES.md
Plan de desarrollo: docs/LIFECYCLE_PLAN.md
Design System: docs/design/DESIGN_SYSTEM_INCADEducativa.md
Mapeo shadcn: docs/design/SHADCN_THEME.md
Catálogo de componentes: docs/design/COMPONENTS.md

## Visión del producto
La plataforma educativa es el PRODUCTO CENTRAL. Cualquier persona del mundo
puede inscribirse a cursos, capacitaciones y carreras del INCADE.
Incluye gestión administrativa interna completa (admin, docentes, revisión
de contenido, certificados, sistema de puntos).
El coworking es un MÓDULO DE SERVICIO dentro de la plataforma (Etapa 2),
para la comunidad interna y externa de Posadas.

## Etapas de desarrollo
- ETAPA 1 (semanas 1-10):  MVP Plataforma Educativa — producto central
- ETAPA 2 (semanas 11-20): Módulo Coworking como servicio + Tutorías + Talleres
- ETAPA 3 (semanas 21+):   Apertura pública total — catálogo abierto, suscripciones, leads, comunidad

## Stack
- Frontend/PWA: Next.js 14 + TypeScript + App Router
- UI: shadcn/ui tematizado con DS v2.1 + Tailwind CSS + Lucide React + Inter
- Backend: tRPC + Next.js API Routes
- DB/Auth: Supabase (PostgreSQL + RLS + Auth + Storage + Realtime)
- Pagos: MercadoPago SDK v2 (coworking en E2; cursos pagos en E3)
- Email: Resend | WhatsApp: Twilio (E2)
- IA: Claude API claude-sonnet-4 (tutor IA, asistente admin)
- PDF/QR: React-PDF + qrcode npm
- DevOps: Vercel + GitHub Actions
- Testing: Playwright (E2E) + Vitest (unit)
- Monitoreo: Sentry + Vercel Analytics

## Módulos del sistema
| Módulo                  | Flag                | Etapa | Estado inicial |
|-------------------------|---------------------|-------|----------------|
| core/auth               | siempre activo      | E1    | activo         |
| educativa/cursos        | FEATURE_EDUCATIVA   | E1    | true           |
| educativa/carreras      | FEATURE_EDUCATIVA   | E1    | true           |
| educativa/evaluaciones  | FEATURE_EDUCATIVA   | E1    | true           |
| educativa/anuncios      | FEATURE_EDUCATIVA   | E1    | true           |
| educativa/certificados  | FEATURE_EDUCATIVA   | E1    | true           |
| educativa/docentes      | FEATURE_EDUCATIVA   | E1    | true           |
| servicios/coworking     | FEATURE_COWORKING   | E2    | false          |
| servicios/tutorias      | FEATURE_TUTORIAS    | E2    | false          |
| servicios/talleres      | FEATURE_TALLERES    | E2    | false          |
| comunidad/foro          | FEATURE_COMUNIDAD   | E3    | false          |
| publica/catalogo        | FEATURE_PUBLICA     | E3    | false          |

## Feature flags (.env)
FEATURE_EDUCATIVA=true     # E1 — producto central
FEATURE_COWORKING=false    # E2 — módulo de servicio
FEATURE_TUTORIAS=false     # E2
FEATURE_TALLERES=false     # E2
FEATURE_COMUNIDAD=false    # E3
FEATURE_PUBLICA=false      # E3

## Roles: admin | docente | alumno | coordinador | comunidad | lead
- admin: control total — usuarios, contenido, flags, reportes, curación
- docente: crea contenido, NUNCA publica directamente
- alumno: alumno INCADE importado por CSV, acceso completo + descuentos.
  Puede recibir `can_teach` y ser docente de cursos puntuales (rol dual, granular por curso)
- coordinador: reservas en lote (E2), carga de materiales si Admin habilita
- comunidad: usuario externo, registro libre (E3), compra cursos/suscripción
- lead: visitante registrado por taller gratuito (E3); puede subir a comunidad o, por Admin, a alumno
- Conversión de roles vía `convert_user_role()` (solo Admin), aditiva y auditada en `role_history`

## REGLAS CRÍTICAS — nunca violar
1. Docentes NO publican — toda publicación pasa por revisión del Admin
2. Alumnos INCADE NO se auto-registran — se importan por CSV (E1/E2).
   Usuarios comunidad SÍ se auto-registran, solo cuando FEATURE_PUBLICA=true (E3).
   **Excepción acotada (v3.5, Sprint 13-14):** con FEATURE_COWORKING=true y
   FEATURE_PUBLICA=false (E2), un visitante sin cuenta SÍ puede auto-registrarse como
   `comunidad` únicamente como parte del flujo de reserva de Coworking (CU-06, registro
   mínimo nombre+email+contraseña en el paso de pago). No abre registro general de la
   plataforma — el único punto de entrada es el flujo de reserva bajo
   `/servicios/coworking`, nunca `/registro` ni un link de alta libre en el resto del sitio
3. Toda migración de schema va en supabase/migrations/ con número secuencial
4. RLS siempre activo en Supabase — usar SIEMPRE la función is_admin()
   (security definer) en policies, NUNCA subqueries a public.users
   (causa recursión infinita)
5. Verificación pública de certificados via RPC verify_certificate(uuid)
   — nunca SELECT directo (la página /verificar/[uuid] no tiene sesión)
6. Feature flags via env vars — nunca hardcodear módulos desactivados
7. Sistema de puntos es ledger APPEND-ONLY: nunca UPDATE ni DELETE en points_log
8. Design System v2.1 obligatorio — solo tokens --edu-* e --inc-* documentados.
   Fuente: Inter (Google Fonts). Íconos: Lucide React exclusivamente.
   Sin colores hex hardcodeados en componentes. Sin ALL CAPS en botones.
9. Webhook de MercadoPago es la ÚNICA fuente de verdad del estado de pago.
   Verificar firma x-signature en cada webhook
10. No modificar CLAUDE.md sin aprobación del equipo
11. INCADEducativa es el hub central del ecosistema INCADE. No heredar layout,
    componentes ni identidad de INCAJOB (light mode, #5B2A86). Solo los puntos
    de contacto mínimos del DS §6: violeta #9B30FF, Inter, logo mark "IN".
12. Las CARRERAS solo las asigna el Admin (reflejo de matrícula presencial real).
    Ningún flujo automático (pago, webhook, nurturing) asigna una carrera ni
    convierte a alumno. Las carreras NO son comprables online (ADR-15).
13. Conversión de roles es ADITIVA: nunca borra historial (cursos, certificados,
    puntos, pagos). Un email = un perfil (no duplicar cuentas). Cada cambio se
    registra en users.role_history y dispara notificación. Usar siempre
    convert_user_role() — nunca UPDATE directo de role (ADR-16).

## Design System (obligatorio — leer ANTES de crear componentes)
Fuente: docs/design/DESIGN_SYSTEM_INCADEducativa.md v2.1

- Modo: dark mode exclusivo. Sin light mode.
- Primario: `--inc-violet #9B30FF` · Acento: `--inc-magenta #C026D3`
- Gradiente de marca: `linear-gradient(135deg, #9B30FF 0%, #C026D3 100%)`
- Superficies: `--edu-bg #08080F` / `--edu-surface #100F1E` / `--edu-surface-alt #151428` / `--edu-surface-raised #1C1A35`
- Tipografía: Inter (Google Fonts). Body 14px / line-height 1.65. Pesos: 400/500/600/700
- Íconos: Lucide React. Prohibido Tabler u otros sin aprobación del equipo.
- Radios: 6px (sm·chips) · 10px (md·botones·inputs) · 14px (lg·cards) · 20px (xl·modales) · 999px (pill)
- Estados LMS: success `#10B981` · warning `#F59E0B` · danger `#EF4444` · gold `#E8C97A` (solo certificados)
- Implementación globals.css: DS §5 + SHADCN_THEME.md bloque CSS
- Implementación Tailwind: tailwind.config.ts del DS §5
- shadcn: tematizar vía CSS variables según docs/design/SHADCN_THEME.md
- Catálogo de componentes: docs/design/COMPONENTS.md

## Convenciones de nomenclatura
| Elemento        | Convención              | Ejemplo                          |
|-----------------|-------------------------|----------------------------------|
| Componentes     | PascalCase              | CourseCard.tsx                   |
| Hooks           | prefijo use             | useCourseProgress.ts             |
| Server actions  | sufijo Action           | enrollUserAction.ts              |
| Rutas           | kebab-case              | /cursos/[slug]/lecciones/[id]    |
| Tablas DB       | snake_case plural       | lesson_progress                  |
| Feature flags   | SCREAMING_SNAKE         | FEATURE_COWORKING                |
| Env cliente     | prefijo NEXT_PUBLIC_    | NEXT_PUBLIC_SUPABASE_URL         |

> **Idioma del schema (C-4):** las tablas y columnas de la DB usan **español**
> (ej. `preguntas`, `respuestas`, `puntos`, `carrera_id`). La migración SQL es la
> fuente de verdad de los nombres. Los addendums en inglés (`questions`, `answers`)
> son solo referencia conceptual; el código sigue siempre la migración.

## Estructura del proyecto
```
incadeducativa/
├── CLAUDE.md                          ← este archivo (fuente de verdad)
├── PRIMEROS_PASOS.md                  ← guía de setup design-first
├── README.md
├── docs/
│   ├── design/                        ← fuente de verdad visual
│   │   ├── DESIGN_SYSTEM_INCADEducativa.md  ← DS v2.1 (leer primero)
│   │   ├── SHADCN_THEME.md            ← mapeo tokens → shadcn
│   │   └── COMPONENTS.md              ← catálogo mínimo E1
│   ├── INCADEducativa_Spec_v3.md      ← spec completo (v3.4, fuente de verdad)
│   ├── FUNCIONALIDADES.md             ← checklist por rol (tablero de avance)
│   ├── LIFECYCLE_PLAN.md              ← plan sprint a sprint
│   ├── addenda/                       ← addenda 01-04 archivados (integrados en v3.4, no editar)
│   │   ├── ADDENDUM_01_Motor_Evaluaciones.md
│   │   ├── ADDENDUM_02_Comunicacion_Docente_Grupo.md
│   │   ├── ADDENDUM_03_Coworking_Modulo_Independiente.md
│   │   └── ADDENDUM_04_Conversion_Roles_Casos_Uso.md
│   └── mockups/
│       ├── INCADEducativa_Mockup_v4.html  ← 13 pantallas navegables (DS v2.1)
│       └── archive/
│           └── INCADEducativa_Mockup_v3.html  ← obsoleto, no usar
├── supabase/
│   └── migrations/
│       ├── 001_educativa_core.sql     ← E1: core, 13 tablas + RLS (sin deps)
│       ├── 002_coworking_module.sql   ← E2: coworking (NO ejecutar en E1)
│       ├── 003_motor_evaluaciones_comunicacion.sql ← E1: evaluaciones + comunicación (+5 tablas)
│       ├── 004_conversion_roles.sql   ← E1: conversión de roles (rol lead, can_teach)
│       └── 005_rls_fixes_e1.sql       ← E1: fixes RLS + ledger + constraints
│       # Orden E1: 001 → 003 → 004 → 005 (18 tablas). 002 solo con FEATURE_COWORKING.
├── src/
│   ├── app/                           ← Next.js App Router
│   │   ├── (auth)/                    ← login, activar-cuenta, recuperar
│   │   ├── (dashboard)/               ← área autenticada
│   │   │   ├── dashboard/
│   │   │   ├── cursos/
│   │   │   ├── carreras/
│   │   │   ├── certificados/
│   │   │   ├── admin/
│   │   │   ├── docente/
│   │   │   └── servicios/             ← coworking (E2, tras flag)
│   │   ├── verificar/[uuid]/          ← verificación pública sin login
│   │   ├── design-preview/            ← QA visual de tokens y componentes
│   │   └── api/                       ← tRPC + webhooks MP
│   ├── components/
│   │   ├── ui/                        ← shadcn tematizado (DS v2.1)
│   │   └── layout/                    ← AuthLayout, DashboardLayout, Sidebar, Topbar
│   ├── lib/                           ← supabase/, trpc/, mercadopago/, flags.ts
│   └── modules/                       ← educativa/, coworking/, admin/
└── tests/
    ├── e2e/                           ← Playwright
    └── unit/                          ← Vitest
```

## Flujo de trabajo SDD con Claude Code
1. Antes de cada feature: leer la sección relevante del spec y FUNCIONALIDADES.md
2. Antes de crear un componente: verificar COMPONENTS.md y SHADCN_THEME.md
3. Implementar respetando reglas críticas y convenciones
4. Marcar el checkbox correspondiente en FUNCIONALIDADES.md al completar
5. Si el código necesita contradecir el spec → actualizar el spec PRIMERO
   (versionar v3.5, v3.6...) y luego implementar
6. Si el código necesita contradecir el DS → actualizar el DS PRIMERO
   (versionar v2.1) → mockup → código
7. Nunca dejar que código, spec y DS diverjan

## Prompts tipo para Claude Code
Feature nueva:
  "Según CLAUDE.md v3.4 y el spec v3.4, implementá [funcionalidad] para el rol [rol].
   Stack definido. Design System v2.1: Inter + Lucide + tokens --edu-* e --inc-*."
Migración:
  "Creá la migración SQL para [tabla] respetando los ADRs del spec.
   Usá is_admin() en las RLS policies. Número secuencial siguiente."
Componente:
  "Creá [Nombre] según DESIGN_SYSTEM v2.1 y COMPONENTS.md.
   shadcn/ui base con SHADCN_THEME, Lucide React, accesible (aria labels, keyboard nav)."
Tests:
  "Escribí tests Playwright para CU-[N] del spec.
   Cubrir flujo principal + alternativas + criterios de aceptación."
Review:
  "Revisá este código contra las reglas críticas del CLAUDE.md:
   RLS con is_admin(), flags, naming, DS v2.1 (tokens + Inter + Lucide), ledger append-only, tipos."
