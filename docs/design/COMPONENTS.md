# COMPONENTS — INCADEducativa · Catálogo mínimo E1
**Versión 1.0 · Junio 2026**
Especificación de tokens y variantes por componente para el MVP Educativo.

> Referencia de implementación para Cursor + Claude Code. Antes de crear un componente, verificar que exista aquí. Si no existe, documentarlo primero (SDD).
> Fuente de tokens: `docs/design/DESIGN_SYSTEM_INCADEducativa.md v2.0`
> Mapeo shadcn: `docs/design/SHADCN_THEME.md v1.0`

---

## Reglas generales

- **Íconos:** Lucide React exclusivamente. `import { NombreIcono } from 'lucide-react'`
- **Tipografía:** Inter (Google Fonts). Nunca confiar en system font como primaria.
- **Botones:** SemiBold 600, 14px, Sentence case. Nunca ALL CAPS.
- **Colores:** solo tokens `--inc-*` y `--edu-*` vía CSS variables o clases `inc-` / `edu-` de Tailwind. Ningún hex hardcodeado en componentes.
- **Dark mode:** obligatorio. No existe modo claro en INCADEducativa.
- **Accesibilidad:** `aria-label` en íconos sin texto, `role` en elementos interactivos, navegación por teclado.

---

## 1. Button

shadcn base: `<Button>` — 3 variantes principales.

### Especificación

| Variante | Fondo | Texto | Border | Hover | Radius | Uso |
|---|---|---|---|---|---|---|
| `primary` | `--inc-violet` `#9B30FF` | `#FFFFFF` | none | `--inc-violet-hover` `#8520EE` | `--radius-md` `10px` | CTAs principales — "Continuar aprendiendo", "Inscribirse" |
| `outline` | transparent | `--inc-violet` | `0.5px solid --inc-violet-border-strong` | `--inc-violet-subtle` bg | `--radius-md` `10px` | Acciones secundarias — "Ver verificación", "Cancelar" |
| `destructive` | `--edu-danger-subtle` | `--edu-danger` `#EF4444` | `0.5px solid --edu-danger-border` | opacidad `.85` | `--radius-md` `10px` | Acciones destructivas — "Rechazar", "Eliminar" |
| `ghost` | transparent | `--edu-text-muted` | none | `--inc-violet-subtle` bg | `--radius-md` `10px` | Acciones terciarias en nav, iconos |

### Tipografía
- Font-size: `14px`
- Font-weight: `600` (SemiBold)
- Sentence case — nunca ALL CAPS
- Gap íconos: `8px`

### Tamaños
| Size | Padding | Uso |
|---|---|---|
| `sm` | `5px 11px` | Tablas, acciones inline |
| `default` | `8px 16px` | Uso estándar |
| `lg` | `12px 24px` | CTAs de hero |

### Código de referencia

```tsx
// Primary
<Button className="bg-[--inc-violet] hover:bg-[--inc-violet-hover] text-white font-semibold rounded-md">
  <Play className="w-4 h-4 mr-2" />
  Continuar aprendiendo
</Button>

// Outline
<Button variant="outline" className="border-[--inc-violet-border-strong] text-[--inc-violet] hover:bg-[--inc-violet-subtle] rounded-md">
  Ver verificación
</Button>
```

---

## 2. Card

shadcn base: `<Card>` — superficie estándar del LMS.

### Especificación

| Token | Valor |
|---|---|
| Background | `--edu-surface` `#100F1E` |
| Border | `0.5px solid --edu-border` (`rgba(155,48,255,0.20)`) |
| Border-radius | `--radius-lg` `14px` |
| Shadow | `--shadow-card` `0px 2px 8px rgba(0,0,0,0.40)` |
| Hover shadow | `--shadow-card-violet` `0px 4px 20px rgba(155,48,255,0.15)` |
| Hover border | `--edu-border-strong` `rgba(155,48,255,0.45)` |

### Variantes

| Variante | Diferencia | Uso |
|---|---|---|
| `default` | Surface `#100F1E` | Paneles, listas, contenedores |
| `elevated` | Surface `--edu-surface-alt` `#151428` | Hero sections, módulos destacados |
| `raised` | Surface `--edu-surface-raised` `#1C1A35` | Modales, dropdowns |
| `certificate` | Border + bg dorado: `--edu-gold-subtle` / `--edu-gold-border` | Exclusivo para tarjetas de certificado |

---

## 3. Badge / Chip de estado

No es un componente shadcn extendido — es un `<span>` con clases Tailwind + tokens DS.

### Estados LMS

| Estado | Fondo | Texto | Border | Uso en LMS |
|---|---|---|---|---|
| `active` / `published` | `--inc-violet-subtle` | `#A855F7` | `--inc-violet-border` | Curso activo, sesión en curso |
| `completed` / `approved` | `--edu-success-subtle` | `#34d399` | `--edu-success-border` | Módulo completado, clase aprobada |
| `pending` / `in-review` | `--edu-warning-subtle` | `#FBBF24` | `--edu-warning-border` | Cuestionario pendiente, contenido en revisión |
| `error` / `failed` | `--edu-danger-subtle` | `#F87171` | `--edu-danger-border` | Quiz reprobado, no-show |
| `locked` | `rgba(255,255,255,0.05)` | `--edu-text-faint` | `rgba(255,255,255,0.08)` | Contenido bloqueado |
| `gold` | `--edu-gold-subtle` | `--edu-gold` | `--edu-gold-border` | Solo certificados / logros máximos |

### Tipografía
- Font-size: `12px`
- Font-weight: `600` (SemiBold)
- Padding: `2px 8px`
- Border-radius: `--radius-sm` `6px` (inline) / `--radius-pill` `999px` (pill)

---

## 4. Input

shadcn base: `<Input>` y `<Textarea>`.

### Especificación

| Token | Valor |
|---|---|
| Background | `rgba(255,255,255,0.06)` |
| Border | `0.5px solid --edu-border` |
| Border-radius | `--radius-md` `10px` |
| Text | `--edu-text` `#FFFFFF` |
| Placeholder | `--edu-text-faint` `rgba(255,255,255,0.30)` |
| Focus border | `--edu-border-strong` `rgba(155,48,255,0.45)` |
| Focus ring | `--inc-violet-border-strong` |
| Font-size | `14px` · Regular 400 |
| Padding | `8px 12px` |

### Label

- Font-size: `12px` · Medium 500
- Color: `--edu-text-muted`
- Margin-bottom: `4px`

### Estados de error

- Border: `--edu-danger-border`
- Focus ring: `--edu-danger`
- Mensaje de error: `12px`, `--edu-danger`, icono `AlertCircle` de Lucide

---

## 5. Progress

Barra de progreso — usada en CourseCard, panel de carrera, lesson player.

### Especificación

| Token | Valor |
|---|---|
| Track background | `rgba(255,255,255,0.08)` |
| Fill gradient | `linear-gradient(90deg, --inc-violet, --inc-magenta)` |
| Height | `3px` (CourseCard) · `4px` (standalone) |
| Border-radius | `--radius-pill` `999px` |

### Variantes semánticas

| Variante | Fill color | Uso |
|---|---|---|
| `default` | Gradiente violeta→magenta | Progreso general de curso |
| `success` | `--edu-success` `#10B981` | Módulo 100% completado |
| `warning` | `--edu-warning` `#F59E0B` | Timer de quiz (decrementa) |

---

## 6. Sidebar

Navegación lateral del dashboard — presente en todas las pantallas con layout completo.

### Especificación

| Token | Valor |
|---|---|
| Background | `rgba(0,0,0,0.30)` sobre `--edu-surface` |
| Border-right | `0.5px solid --edu-border` |
| Width | `180px` |
| Padding | `10px 8px` |

### Ítem de navegación

| Estado | Background | Text | Border-left | Lucide icon size |
|---|---|---|---|---|
| Inactivo | transparent | `--edu-text-faint` | none | `18px` / `w-[18px]` |
| Hover | `rgba(255,255,255,0.05)` | `--edu-text-muted` | none | `18px` |
| Activo | `--inc-violet-subtle` | `#A855F7` | `2px solid --inc-violet` | `18px` |

### Sección heading

- Font-size: `11px` · SemiBold 600 · UPPERCASE · `letter-spacing: 1.2px`
- Color: `rgba(255,255,255,0.22)`
- Padding: `8px 6px 3px`

### Badge de sidebar (puntos, notificaciones)

- Background: `--inc-violet`
- Color: `#FFFFFF`
- Font-size: `11px` · SemiBold 600
- Border-radius: `--radius-pill`
- Padding: `1px 6px`

---

## 7. Topbar

Barra superior fija del dashboard.

### Especificación

| Token | Valor |
|---|---|
| Background | `rgba(0,0,0,0.55)` con `backdrop-filter: blur(8px)` |
| Border-bottom | `0.5px solid --edu-border` |
| Height | `46px` |
| Padding | `0 16px` |

### Logo mark "IN"

- Tamaño: `28×28px`
- Background: `--inc-violet`
- Border-radius: `6px`
- Font-size: `11px` · SemiBold 600 · `#FFFFFF`

### Nav items (top)

- Font-size: `13px` · Medium 500 (inactivo) · SemiBold 600 (activo)
- Padding: `5px 11px` · `border-radius: 5px`
- Activo: `--inc-violet-subtle` bg, `#A855F7` text

### Avatar de usuario

- Tamaño: `28×28px` · `border-radius: 50%`
- Background: `--inc-violet`
- Border: `1.5px solid --inc-violet-border-strong`
- Font-size: `11px` · SemiBold 600 · iniciales

### Role badge

| Rol | Background | Text | Border |
|---|---|---|---|
| admin | `--inc-violet-subtle` | `#A855F7` | `--inc-violet-border` |
| docente | `rgba(192,38,211,0.15)` | `#e879f9` | `rgba(192,38,211,0.30)` |
| alumno | `--edu-success-subtle` | `#34d399` | `--edu-success-border` |

---

## 8. CourseCard

Tarjeta de curso — usada en grillas de 2 y 3 columnas.

### Especificación

| Token | Valor |
|---|---|
| Background | `rgba(255,255,255,0.04)` |
| Border | `0.5px solid --edu-border` |
| Border-radius | `--radius-lg` `14px` |
| Hover border | `--edu-border-strong` |
| Hover shadow | `--shadow-card-violet` |
| Overflow | hidden |

### Estructura interna

```
CourseCard
├── Header (58px height)
│   ├── Background: color sutil relacionado con categoría
│   └── Lucide icon (24px, color de acento)
└── Body (padding 8px 10px)
    ├── CategoryTag (12px · SemiBold · UPPERCASE · letter-spacing 0.7px · --inc-violet)
    ├── CourseName (13px · Medium 500 · lh 1.3)
    └── ProgressRow
        ├── ProgressBar (3px, fill gradiente)
        └── ProgressPercent (10px · --edu-text-muted)
```

### Colores de header por categoría (sugeridos)

| Categoría | Background | Ícono Lucide | Color ícono |
|---|---|---|---|
| Marketing | `rgba(155,48,255,0.10)` | `BarChart3` | `--inc-violet` |
| Finanzas | `rgba(192,38,211,0.08)` | `TrendingUp` | `--inc-magenta` |
| RRHH / Liderazgo | `rgba(16,185,129,0.08)` | `Users` | `--edu-success` |
| Innovación | `rgba(245,158,11,0.08)` | `Lightbulb` | `--edu-warning` |

---

## 9. Estados semánticos LMS — componentes de notificación

Banners y notificaciones inline. No son Toasts de shadcn — son elementos persistentes en pantalla.

### Especificación por tipo

| Tipo | Background | Border | Text | Lucide icon |
|---|---|---|---|---|
| `info` (violeta) | `--inc-violet-subtle` | `--inc-violet-border-strong` | `#A855F7` | `Info` |
| `success` | `--edu-success-subtle` | `--edu-success-border` | `#34d399` | `CheckCircle2` |
| `warning` | `--edu-warning-subtle` | `--edu-warning-border` | `#FBBF24` | `AlertTriangle` |
| `danger` | `--edu-danger-subtle` | `--edu-danger-border` | `#F87171` | `XCircle` |

### Dimensiones

- Border-radius: `--radius-md` `10px` ó `--radius-lg` `14px`
- Padding: `10px 14px`
- Gap íconos: `10px`
- Font-size: `13px`

---

## 10. Certificado — CertificateCard

Componente exclusivo de la sección "Mis certificados".

### Especificación

```
CertificateCard
├── Container
│   ├── Background: --edu-surface-alt (#151428)
│   ├── Border: 0.5px solid --edu-gold-border
│   ├── Border-radius: --radius-xl (20px)
│   └── Shadow: --shadow-card-violet
├── Left: CertIcon
│   ├── Size: 52×52px · border-radius: --radius-lg
│   ├── Background: --edu-gold-subtle
│   ├── Border: --edu-gold-border
│   └── Icon: Award (Lucide) · 28px · --edu-gold
├── Center: Info
│   ├── Title: 16px · SemiBold 600
│   ├── Subtitle: 12px · --edu-text-muted
│   ├── ID: 11px · monospace · --inc-violet
│   └── Actions: Button primary + Button outline
└── Right: QRPlaceholder
    ├── Size: 64×64px · border-radius: --radius-md
    ├── Background: --edu-gold-subtle
    ├── Border: --edu-gold-border
    └── Icon: QrCode (Lucide) · 32px · --edu-gold
```

**Regla:** el color dorado (`--edu-gold`) se usa EXCLUSIVAMENTE en este componente y en el nodo final del mapa de carrera. No en navegación, no en estados de progreso, no en botones.

---

*INCADEducativa · Design System v2.0 — COMPONENTS v1.0 · Junio 2026*
