# INCADEducativa

Plataforma Educativa Digital de la Escuela de Negocios INCADE — Posadas, Misiones.
**incadeducativa.com**

La plataforma educativa es el producto central: personas de cualquier parte del
mundo pueden inscribirse a cursos, capacitaciones y carreras del INCADE, con
gestión administrativa interna completa. El coworking es un módulo de servicio
de la institución para la comunidad interna y externa (Etapa 2).

---

## Identidad visual

INCADEducativa es el **hub central** del ecosistema digital INCADE. Su identidad deriva
directamente de `incade.edu.ar`: dark mode profundo, violeta brillante, tipografía Inter.

| Elemento | Valor |
|---|---|
| Modo | Dark mode exclusivo |
| Color primario | `#9B30FF` (`--inc-violet`) |
| Fondo base | `#08080F` (`--edu-bg`) |
| Tipografía | Inter (Google Fonts) |
| Íconos | Lucide React |

> Leer `docs/design/DESIGN_SYSTEM_INCADEducativa.md` **antes de codear** — es la fuente de verdad visual.

---

## Quick start

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# → completar con las keys de tu proyecto Supabase

# 3. Aplicar migraciones E1 en Supabase EN ORDEN (18 tablas)
# Dashboard > SQL Editor > ejecutar, en este orden:
#   001_educativa_core → 003_motor_evaluaciones_comunicacion → 004_conversion_roles → 005_rls_fixes_e1
# (NO ejecutar 002_coworking_module: es E2, solo con FEATURE_COWORKING)

# 4. Aplicar Design System en código
# Ver PRIMEROS_PASOS.md Paso 2 — globals.css + tailwind.config.ts

# 5. Desarrollo
npm run dev
```

---

## Documentación (leer en este orden)

| # | Documento | Contenido |
|---|---|---|
| 1 | `CLAUDE.md` | Fuente de verdad para desarrollo con IA — reglas críticas, stack, prompts |
| 2 | `docs/design/DESIGN_SYSTEM_INCADEducativa.md` | Fuente de verdad **visual** — tokens, tipografía, geometría |
| 3 | `docs/design/SHADCN_THEME.md` | Mapeo tokens DS → variables shadcn/ui |
| 4 | `docs/design/COMPONENTS.md` | Catálogo de componentes mínimos E1 |
| 5 | `docs/INCADEducativa_Spec_v3.md` | Spec completo del sistema — ADRs, CU, DB, flujos |
| 6 | `docs/FUNCIONALIDADES.md` | Checklist por rol — tablero de avance |
| 7 | `docs/LIFECYCLE_PLAN.md` | Plan de desarrollo sprint a sprint |
| 8 | `docs/mockups/INCADEducativa_Mockup_v4.html` | 13 pantallas navegables (DS v2.0) |
| — | `docs/addenda/` | Addenda 01-04 archivados (origen, ya integrados en Spec v3.4) — referencia histórica |

---

## Etapas

| Etapa | Semanas | Foco |
|-------|---------|------|
| E1 | 1–10 | MVP Plataforma Educativa (producto central) |
| E2 | 11–20 | Módulo Coworking + Tutorías + Talleres |
| E3 | 21+ | Apertura pública, suscripciones, comunidad |

---

## Metodología

**Spec-Driven Development (SDD)**: el spec, el Design System y el código son la misma fuente de verdad. Antes de implementar cualquier feature, leer la sección correspondiente del spec y el DS. Si el código contradice alguno de los dos, actualizar el documento primero (versionado), luego implementar.

---

## Equipo

Escobar, José Gustavo · Schwegler, Alan
