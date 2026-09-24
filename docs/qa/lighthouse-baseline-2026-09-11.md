# Lighthouse — go-live Etapa 1

Corrido contra **Preview Vercel** (OIDC Trusted Sources), no `next dev`:

`https://incadeducativa-abgu37vcd-josegmescobar-2036s-projects.vercel.app`

JSON: `docs/qa/lighthouse/lh-*.json` · reporte: `docs/qa/preview-qa-report.json`

| Página | Perf | A11y | LCP | CLS | INP | Fecha |
|---|---|---|---|---|---|---|
| `/` | 50 | 100 | 3.9 s | 0 | — | 2026-09-24 |
| `/login` | 76 | 98 | 2.6 s | 0 | — | 2026-09-24 |
| `/carreras` | 81 | 100 | 1.7 s | 0 | — | 2026-09-24 |
| `/design-preview` | 73 | 100 | 2.1 s | 0 | — | 2026-09-24 |
| `/servicios/coworking` | 77 | 100 | 1.5 s | 0 | — | 2026-09-24 |
| `/cursos` | — | — | — | — | — | redirect con `publica=off` (soft launch) |
| `/dashboard` | — | — | — | — | — | requiere sesión (medir en follow-up) |
| `/certificados` | — | — | — | — | — | requiere sesión |
| `/docente` | — | — | — | — | — | requiere sesión |

Umbral cierre Etapa 2: performance mobile >= 90 · CLS < 0.1 · INP < 200 ms.

## Gaps (&lt; 90 Perf)

Todas las páginas públicas medidas quedaron **por debajo de 90**. Backlog mínimo:

- Home (50): LCP 3.9s — revisar hero/fonts, dynamic imports, menos JS inicial
- Resto (73–81): imágenes `next/image`, reducir round-trips auth/flags en shell

No bloquea firma soft-launch; sí bloquea “Lighthouse >= 90” del DoD visual hasta el backlog.

## Mitigaciones ya en código

- `cache()` auth/flags
- `next/font` Inter
- `next/image` en SpaceCard
- Sidebar Sheet + skeletons loading (`docente/loading.tsx`)
- Vercel Analytics montado
- Tipografía DS v3.0 (`text-display|title|section|body|caption`) en pantallas núcleo
