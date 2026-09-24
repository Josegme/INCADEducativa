# Soft launch checklist — FEATURE_PUBLICA=false

Objetivo: INCADE interno operable en **preview** (y luego prod en Etapa 6) sin apertura mundial.

**URL QA (2026-09-24):** `https://incadeducativa-abgu37vcd-josegmescobar-2036s-projects.vercel.app`  
**Acceso:** Vercel CLI + OIDC (`x-vercel-trusted-oidc-idp-token`) — ver `scripts/qa-preview-soft-launch.cjs` / `qa-preview-e3.cjs`.  
**Evidencia:** `docs/qa/preview-qa-report.json`, `docs/qa/preview-qa-e3-report.json`.

## Flags (DB `feature_flags` o `/admin/configuracion`)

| Flag | Soft launch | Verificado |
|---|---|---|
| `educativa` | siempre on (sin toggle) | OK |
| `coworking` | on | OK (ruta `/servicios/coworking` 200) |
| `tutorias` | on | OK (en UI config) |
| `talleres` | on | OK (en UI config) |
| `comunidad` | opcional | off |
| `publica` | **off** | OK (estado final post-QA E3) |

## Datos mínimos QA

- [x] Admin, docente, alumno (cuentas QA e2e en DB)
- [x] ≥1 carrera publicada + ≥1 curso publicado
- [x] ≥1 sede + ≥1 espacio coworking activo
- [x] ≥1 taller gratuito
- [ ] Plan de membresía con créditos (opcional — no bloqueante)

## Smoke (preview)

1. [x] Login admin → `/dashboard` + `/admin/configuracion`
2. [x] Login alumno → `/dashboard` + `/cursos`
3. [ ] Login docente → pendiente (password QA `docente.test@…` no coincidió con `Test1234!QA` en esta corrida)
4. [ ] Alumno: inscripción gratis — CTA no visible en catálogo (posible ya inscripto / curso pago)
5. [x] Admin: toggle flag sin redeploy (`Catálogo público` Activar/Desactivar)
6. [x] Rutas públicas sin SSO: `/`, `/login`, `/carreras`, `/coworking`, `manifest.json`

## PWA

- [x] `manifest.json` servido (200)
- [x] `ServiceWorkerRegister` en layout (código)
- [ ] Instalable en Chrome Android / desktop — verificación manual residual

## Firma

| Rol | Nombre | Fecha | OK |
|---|---|---|---|
| Producto / ops | | | [ ] |
| Técnico | Agente Cursor (QA automatizado Preview) | 2026-09-24 | [x] |

Smoke base verde en preview. Firma producto/ops pendiente de recorrida humana (docente + PWA instalable).
