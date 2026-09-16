# Soft launch checklist — FEATURE_PUBLICA=false

Objetivo: INCADE interno operable en **preview** (y luego prod en Etapa 6) sin apertura mundial.

## Flags (DB `feature_flags` o `/admin/configuracion`)

| Flag | Soft launch |
|---|---|
| `educativa` | siempre on (sin toggle) |
| `coworking` | on |
| `tutorias` | on |
| `talleres` | on |
| `comunidad` | opcional |
| `publica` | **off** |

## Datos mínimos QA

- [ ] Admin, docente, alumno (CSV o alta manual)
- [ ] ≥1 carrera publicada + ≥1 curso publicado con lección + evaluación
- [ ] ≥1 sede + ≥1 espacio coworking activo
- [ ] ≥1 taller gratuito (si flag talleres on)
- [ ] Plan de membresía con créditos (opcional para probar canje)

## Smoke (preview)

1. Login alumno / admin / docente
2. Alumno: inscripción a curso gratuito + marcar lección
3. Docente: ver correcciones en `/docente` (< 3 clics a la cola)
4. Reserva coworking: con crédito (membresía o canje) **o** flujo MP sandbox (sin token real hasta Etapa 6)
5. Admin: toggle flags en `/admin/configuracion` sin redeploy

## PWA

```bash
npx lighthouse https://<preview>/ --only-categories=pwa --form-factor=mobile
```

- [ ] `manifest.json` servido
- [ ] Service worker registrado (`ServiceWorkerRegister`)
- [ ] Instalable en Chrome Android / desktop

## Firma

| Rol | Nombre | Fecha | OK |
|---|---|---|---|
| Producto / ops | | | [ ] |
| Técnico | | | [ ] |

Smoke verde en preview antes de Etapa 6.
