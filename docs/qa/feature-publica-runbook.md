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
