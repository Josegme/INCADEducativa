# Lighthouse baseline — 2026-09-11

Medición de partida (Etapa 1.2) sobre mobile, 8 páginas. Servidor local o preview.

| Página | Perf | A11y | LCP | CLS | INP | Notas |
|---|---|---|---|---|---|---|
| `/` | n/d | n/d | n/d | n/d | n/d | Landing reescrita; medir en preview |
| `/login` | n/d | 1.00 (histórico) | n/d | n/d | n/d | Auth layout |
| `/dashboard` | n/d | 1.00 (histórico) | n/d | n/d | n/d | Home alumno con cursos |
| `/cursos` | n/d | 1.00 (histórico) | n/d | n/d | n/d | Catálogo |
| `/carreras` | n/d | 1.00 (histórico) | n/d | n/d | n/d | Vitrina |
| `/certificados` | n/d | 1.00 (histórico) | n/d | n/d | n/d | Requiere sesión |
| `/servicios/coworking` | n/d | 1.00 (histórico) | n/d | n/d | n/d | LCP: `SpaceCard` + `next/image` |
| `/design-preview` | n/d | 1.00 (histórico) | n/d | n/d | n/d | Catálogo DS v3.0 |

## Hallazgos de arquitectura (antes de Etapa 1.4)

- `getUser()` se llamaba 4 veces por navegación (middleware + 2 layouts + page).
- Fuente Inter por `@import` bloqueante en `globals.css`.
- 4 `<img>` crudos; el de `SpaceCard` era el LCP de coworking.

## Mitigaciones aplicadas en esta rama

- `getCurrentUser` / `getCurrentProfile` / `getFlags` con `cache()` de React.
- `next/font/google` Inter.
- `next/image` en `SpaceCard`.
- Sidebar Sheet + Topbar 56 px.

Umbral de cierre de etapa visual: performance mobile >= 90, CLS < 0.1, INP < 200 ms.
Correr `npx lighthouse http://localhost:3000 --form-factor=mobile --only-categories=performance,accessibility --output=json` por página cuando el preview esté arriba y pegar scores reales en una fila nueva.
