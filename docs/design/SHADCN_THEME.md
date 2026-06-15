# SHADCN_THEME — INCADEducativa
**Versión 1.0 · Junio 2026**
Mapeo de tokens del Design System v2.0 a variables nativas de shadcn/ui.

> Este archivo es la fuente de verdad para tematizar shadcn. Copiar el bloque CSS en `src/app/globals.css` DESPUÉS del bloque de variables del Design System (§5 del DS).

---

## Por qué este mapeo es necesario

shadcn/ui no usa `--inc-violet` ni `--edu-surface` directamente — consume sus propias variables CSS (`--primary`, `--background`, `--card`, etc.). Sin este mapeo, cada componente shadcn usa sus defaults en blanco/gris y rompe el Design System.

La estrategia: las variables DS (`--inc-*`, `--edu-*`) son la fuente de verdad. Las variables shadcn apuntan a ellas. Nunca hardcodear un hex directamente en una variable shadcn.

---

## Bloque CSS a insertar en `globals.css`

```css
/* ── Mapeo shadcn/ui → Design System INCADEducativa v2.0 ── */
/* Insertar después de las variables :root del Design System  */

:root {
  /* shadcn: fondos y superficies */
  --background:           var(--edu-bg);           /* #08080F */
  --foreground:           var(--edu-text);          /* #FFFFFF */
  --card:                 var(--edu-surface);       /* #100F1E */
  --card-foreground:      var(--edu-text);
  --popover:              var(--edu-surface-raised); /* #1C1A35 */
  --popover-foreground:   var(--edu-text);

  /* shadcn: colores primarios */
  --primary:              var(--inc-violet);        /* #9B30FF */
  --primary-foreground:   #FFFFFF;

  /* shadcn: colores secundarios */
  --secondary:            var(--edu-surface-alt);   /* #151428 */
  --secondary-foreground: var(--edu-text);

  /* shadcn: muted (textos y fondos suaves) */
  --muted:                var(--edu-surface-alt);   /* #151428 */
  --muted-foreground:     var(--edu-text-muted);    /* rgba(255,255,255,0.55) */

  /* shadcn: accent (hover de nav, fondos sutiles) */
  --accent:               var(--inc-violet-subtle); /* rgba(155,48,255,0.15) */
  --accent-foreground:    var(--edu-text);

  /* shadcn: estados destructivos */
  --destructive:          var(--edu-danger);        /* #EF4444 */
  --destructive-foreground: #FFFFFF;

  /* shadcn: bordes e inputs */
  --border:               var(--edu-border);        /* rgba(155,48,255,0.20) */
  --input:                var(--edu-border);
  --ring:                 var(--inc-violet-border-strong); /* rgba(155,48,255,0.50) */

  /* shadcn: radio base */
  --radius: var(--radius-md); /* 10px — botones e inputs */
}
```

---

## Tabla de mapeo completo

| Variable shadcn | Token DS | Valor resultante | Componentes afectados |
|---|---|---|---|
| `--background` | `--edu-bg` | `#08080F` | `<body>`, page backgrounds |
| `--foreground` | `--edu-text` | `#FFFFFF` | Texto base |
| `--card` | `--edu-surface` | `#100F1E` | `<Card>`, paneles |
| `--card-foreground` | `--edu-text` | `#FFFFFF` | Texto dentro de cards |
| `--popover` | `--edu-surface-raised` | `#1C1A35` | `<DropdownMenu>`, `<Tooltip>`, `<Select>` |
| `--popover-foreground` | `--edu-text` | `#FFFFFF` | Texto en popovers |
| `--primary` | `--inc-violet` | `#9B30FF` | `<Button variant="default">`, links activos |
| `--primary-foreground` | — | `#FFFFFF` | Texto en botón primario |
| `--secondary` | `--edu-surface-alt` | `#151428` | `<Button variant="secondary">` |
| `--secondary-foreground` | `--edu-text` | `#FFFFFF` | Texto en botón secundario |
| `--muted` | `--edu-surface-alt` | `#151428` | Fondos muted |
| `--muted-foreground` | `--edu-text-muted` | `rgba(255,255,255,0.55)` | Labels, descripciones |
| `--accent` | `--inc-violet-subtle` | `rgba(155,48,255,0.15)` | Hover de ítems de nav |
| `--accent-foreground` | `--edu-text` | `#FFFFFF` | Texto en accent |
| `--destructive` | `--edu-danger` | `#EF4444` | `<Button variant="destructive">`, errores |
| `--destructive-foreground` | — | `#FFFFFF` | Texto en destructive |
| `--border` | `--edu-border` | `rgba(155,48,255,0.20)` | Bordes de `<Input>`, `<Card>`, separadores |
| `--input` | `--edu-border` | `rgba(155,48,255,0.20)` | Borde específico de inputs |
| `--ring` | `--inc-violet-border-strong` | `rgba(155,48,255,0.50)` | Outline de focus |
| `--radius` | `--radius-md` | `10px` | Radio base de botones e inputs |

---

## Radios por componente (override en Tailwind)

shadcn usa `--radius` como base y calcula derivados. Nuestros radios son propios del DS, no derivados. Sobreescribir en `tailwind.config.ts` (ya incluido en DS §5):

| Componente | Radio | Token |
|---|---|---|
| Badges / chips inline | `6px` | `rounded-sm` |
| Botones / Inputs | `10px` | `rounded-md` |
| Cards / paneles | `14px` | `rounded-lg` |
| Modales / hero cards | `20px` | `rounded-xl` |
| Avatares / pills / progress | `9999px` | `rounded-pill` |

---

## Configuración `components.json` de shadcn

Al ejecutar `npx shadcn@latest init`, seleccionar:

```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

`cssVariables: true` es obligatorio — shadcn debe usar las variables CSS, no clases estáticas.

---

## Colores semánticos educativos (NO en shadcn, sí en Tailwind)

Estos estados son propios del LMS y no tienen equivalente nativo en shadcn. Se usan directamente via clases Tailwind personalizadas:

| Estado | Clase Tailwind | Token | Uso |
|---|---|---|---|
| Completado | `bg-edu-success` / `text-edu-success` | `#10B981` | Módulo aprobado, checkmark |
| Pendiente | `bg-edu-warning` / `text-edu-warning` | `#F59E0B` | Timer, clase pendiente |
| Error | `bg-edu-danger` / `text-edu-danger` | `#EF4444` | Formulario inválido, quiz reprobado |
| Certificado | `bg-edu-gold` / `text-edu-gold` | `#E8C97A` | Solo para certificados y logros máximos |

Para fondos sutiles y bordes semánticos, usar `style={{ background: 'var(--edu-success-subtle)', border: '1px solid var(--edu-success-border)' }}` o crear variantes CSS locales.

---

## Orden de archivos en `globals.css`

```css
/* 1. Google Fonts (primer import) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* 2. Variables DS: --inc-* y --edu-* (DS §5) */
:root { ... }

/* 3. Variables shadcn: apuntan a las del DS (este archivo) */
:root { ... }

/* 4. body base */
body { font-family: 'Inter'...; background: var(--edu-bg); ... }

/* 5. Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

*INCADEducativa · Design System v2.0 — SHADCN_THEME v1.0 · Junio 2026*
