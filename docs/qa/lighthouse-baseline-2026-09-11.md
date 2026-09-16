# Lighthouse — go-live Etapa 1

Correr contra **preview Vercel** (no `next dev`):

```bash
npx lighthouse https://<preview>/ --form-factor=mobile --only-categories=performance,accessibility --output=json --output-path=./docs/qa/lh-home.json
```

| Página | Perf | A11y | LCP | CLS | INP | Fecha |
|---|---|---|---|---|---|---|
| `/` | TBD | TBD | TBD | TBD | TBD | — |
| `/login` | TBD | TBD | TBD | TBD | TBD | — |
| `/dashboard` | TBD | TBD | TBD | TBD | TBD | — |
| `/cursos` | TBD | TBD | TBD | TBD | TBD | — |
| `/carreras` | TBD | TBD | TBD | TBD | TBD | — |
| `/certificados` | TBD | TBD | TBD | TBD | TBD | — |
| `/servicios/coworking` | TBD | TBD | TBD | TBD | TBD | — |
| `/design-preview` | TBD | TBD | TBD | TBD | TBD | — |
| `/docente` | TBD | TBD | TBD | TBD | TBD | — |

Umbral cierre Etapa 2: performance mobile >= 90 · CLS < 0.1 · INP < 200 ms.

## Estado go-live

Scores TBD hasta URL de preview estable post-merge. Correr el comando arriba
contra el deployment de `go-live/etapa-1-ops` (o `main`) y completar la tabla.
Si alguna página queda &lt; 90: priorizar imágenes (`next/image`), dynamic
import de paneles admin pesados, y ≤4 round-trips por navegación.

## Mitigaciones ya en código

- `cache()` auth/flags
- `next/font` Inter
- `next/image` en SpaceCard
- Sidebar Sheet + skeletons loading (`docente/loading.tsx`)
- Vercel Analytics montado
- Tipografía DS v3.0 (`text-display|title|section|body|caption`) en pantallas núcleo
