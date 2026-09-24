# Runbook — FEATURE_PUBLICA

## Qué hace el flag

Con `publica=true` (tabla `feature_flags` o fallback env):

- Aparece `/registro` de comunidad (autoregistro general)
- Catálogo de cursos/talleres visible sin sesión (vitrina E3)
- Compra de cursos pagos + suscripción al catálogo (webhook MP = fuente de verdad)
- Nurturing post-taller tiene sentido a escala

Con `publica=false` (default soft launch):

- No hay registro libre fuera del flujo coworking CU-06
- Carreras siguen como vitrina (ADR-15, CTA admisiones)

## Cómo prenderlo (preview primero)

1. Login admin → `/admin/configuracion`
2. Activar **Apertura pública** (`publica`)
3. Verificar en incógnito: `/registro`, `/cursos`, `/talleres`
4. Smoke: alta comunidad → compra curso (sandbox) → webhook simulado
5. Add-on tutorías comunidad: estados en UI del curso

## Producción

- **No** activar en prod hasta Etapa 6 (junto con token MP).
- Soft launch: 24–48h con `publica=off` → luego on si el cliente lo pide.
- Rollback: apagar el toggle (inmediato, sin redeploy).

## Impacto

| Área | Off | On |
|---|---|---|
| Leads/talleres | captura acotada | captura masiva + nurturing |
| Revenue cursos | interno / descuentos | comunidad paga |
| Soporte | bajo | medio-alto |

Ver también: `docs/qa/soft-launch-checklist.md`, `docs/qa/go-live-prod.md`.

## Evidencia preview / QA — 2026-09-24

| Paso | Resultado |
|---|---|
| URL | Preview `incadeducativa-abgu37vcd-…vercel.app` (OIDC) |
| Soft-launch flags | `coworking/tutorias/talleres` on; `publica` off al final |
| Prender `publica` (UI admin) | `Catálogo público` → Activo |
| `/registro` con on | Formulario “Creá tu cuenta” visible |
| `/cursos` con on | Catálogo accesible sin sesión |
| Apagar `publica` | Inactivo otra vez |
| `/registro` con off | Redirect a `/login` |
| Compra/suscripción MP | No ejecutada (sin token real — Etapa 6) |
| Add-on tutorías UI | No ejecutada en esta pasada |

**Reportes:** `docs/qa/preview-qa-e3-report.json`, `docs/qa/preview-qa-report.json`.  
**Estado final:** `publica=off` (soft launch). No tocar prod hasta Etapa 6.
