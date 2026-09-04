# COMPONENTS — INCADEducativa · Catálogo mínimo E1
**Versión 1.3 · Julio 2026**
Especificación de tokens y variantes por componente para el MVP Educativo.

> Referencia de implementación para Cursor + Claude Code. Antes de crear un componente, verificar que exista aquí. Si no existe, documentarlo primero (SDD).
> Fuente de tokens: `docs/design/DESIGN_SYSTEM_INCADEducativa.md v2.1`
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
| `active` / `published` | `--inc-violet-subtle` | `--inc-violet-text` | `--inc-violet-border` | Curso activo, sesión en curso |
| `completed` / `approved` | `--edu-success-subtle` | `--edu-success-text` | `--edu-success-border` | Módulo completado, clase aprobada |
| `pending` / `in-review` | `--edu-warning-subtle` | `--edu-warning-text` | `--edu-warning-border` | Cuestionario pendiente, contenido en revisión |
| `error` / `failed` | `--edu-danger-subtle` | `--edu-danger-text` | `--edu-danger-border` | Quiz reprobado, no-show |
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
| Activo | `--inc-violet-subtle` | `--inc-violet-text` | `2px solid --inc-violet` | `18px` |

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
- Activo: `--inc-violet-subtle` bg, `--inc-violet-text` text

### Avatar de usuario

- Tamaño: `28×28px` · `border-radius: 50%`
- Background: `--inc-violet`
- Border: `1.5px solid --inc-violet-border-strong`
- Font-size: `11px` · SemiBold 600 · iniciales

### Role badge

| Rol | Background | Text | Border |
|---|---|---|---|
| admin | `--inc-violet-subtle` | `--inc-violet-text` | `--inc-violet-border` |
| docente | `rgba(192,38,211,0.15)` | `--inc-magenta-text` | `rgba(192,38,211,0.30)` |
| alumno | `--edu-success-subtle` | `--edu-success-text` | `--edu-success-border` |

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
│   ├── Background: --inc-violet-subtle (único estilo, sin variar por curso)
│   └── Lucide icon (24px, BookOpen, --inc-violet)
└── Body (padding 8px 10px)
    ├── CareerTag (12px · SemiBold · UPPERCASE · letter-spacing 0.7px · --inc-violet)
    │   → "{carrera.nombre} · {nivel}"
    ├── CourseName (13px · Medium 500 · lh 1.3)
    └── ProgressRow
        ├── ProgressBar (3px, fill gradiente)
        └── ProgressPercent (10px · --edu-text-muted)
```

**Nota:** `courses` no tiene columna `categoria` en el schema — no hay header por
categoría. El header usa un único estilo (violeta) y el tag muestra la carrera real
(`carrera_id` → `careers.nombre`), no una categoría inventada.

---

## 9. Estados semánticos LMS — componentes de notificación

Banners y notificaciones inline. No son Toasts de shadcn — son elementos persistentes en pantalla.

### Especificación por tipo

| Tipo | Background | Border | Text | Lucide icon |
|---|---|---|---|---|
| `info` (violeta) | `--inc-violet-subtle` | `--inc-violet-border-strong` | `--inc-violet-text` | `Info` |
| `success` | `--edu-success-subtle` | `--edu-success-border` | `--edu-success-text` | `CheckCircle2` |
| `warning` | `--edu-warning-subtle` | `--edu-warning-border` | `--edu-warning-text` | `AlertTriangle` |
| `danger` | `--edu-danger-subtle` | `--edu-danger-border` | `--edu-danger-text` | `XCircle` |

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

## 11. Table

Tabla de datos — paneles de Admin (usuarios, cursos, resultados de evaluación).

shadcn base: `<Table>` sobre `@radix-ui/react-slot` (sin dependencia Radix propia, es HTML semántico tematizado).

### Especificación

| Elemento | Token | Valor |
|---|---|---|
| Header row | Background | `rgba(255,255,255,0.03)` |
| Header text | Color | `--edu-text-muted` · `12px` · SemiBold 600 · UPPERCASE · `letter-spacing 0.5px` |
| Row border | Border-bottom | `0.5px solid --edu-border-neutral` |
| Row hover | Background | `rgba(255,255,255,0.04)` |
| Cell text | Color / size | `--edu-text` · `13px` · Regular 400 |
| Cell padding | — | `10px 12px` |

---

## 12. Dialog / Modal

Overlay modal — confirmaciones, formularios cortos, importación CSV.

shadcn base: `<Dialog>` sobre `@radix-ui/react-dialog` (foco atrapado, cierre con `Esc`, `aria-modal`).

### Especificación

| Token | Valor |
|---|---|
| Overlay | `rgba(0,0,0,0.70)` |
| Content background | `--edu-surface-raised` `#1C1A35` |
| Content border | `0.5px solid --edu-border-strong` |
| Content border-radius | `--radius-xl` `20px` |
| Content shadow | `--shadow-modal` `0px 8px 40px rgba(0,0,0,0.70)` |
| Título | `16px` · SemiBold 600 |
| Descripción | `13px` · `--edu-text-muted` |
| Botón cerrar | Ícono `X` de Lucide, `18px`, esquina superior derecha |

---

## 13. ImportCsvModal

Modal de importación masiva de usuarios (Admin → `/admin/usuarios`). Ver Spec v3.4 §2.1.

### Estructura interna

```
ImportCsvModal (Dialog, content raised)
├── Header: "Importar usuarios" + descripción (formato esperado de columnas)
├── FileDropzone (estado sin archivo)
│   ├── Border: dashed 1px --edu-border-strong, radius-lg
│   ├── Ícono Upload (Lucide, 24px, --inc-violet) centrado
│   └── Texto: "Arrastrá tu CSV acá o hacé clic para seleccionar" (--edu-text-muted)
├── PreviewTable (tras seleccionar archivo)
│   ├── Columnas: Nombre, Apellido, DNI, Email, Carrera, Estado
│   └── Estado por fila (Badge): `completed` nuevo listo · `pending` duplicado (se omite) ·
│       `error` carrera sin match / campo faltante
└── Footer: Button outline "Cancelar" + Button primary "Confirmar importación"
```

**Formato de columnas del CSV (Sprint 1b, decisión cerrada):** `nombre,apellido,dni,email,carrera`
— `carrera` es el nombre de la carrera tal cual figura en `public.careers.nombre` (matching
exacto case-insensitive; sin match → fila en estado `error`).

---

## 14. Select (nativo)

No es un componente nuevo del catálogo — es un `<select>` HTML tematizado con los mismos
tokens que `Input` (§4): mismo background, border, radius, focus ring. Se usa en
`ConvertRoleModal` para elegir rol/carrera. Las `<option>` llevan
`bg-[--edu-surface-raised]` para que el dropdown nativo respete el dark mode.

---

## 15. RoleHistoryTimeline

Historial de conversiones de rol de un usuario (`users.role_history`). Ver Spec v3.4 ADR-16.

### Estructura interna

```
RoleHistoryTimeline (Dialog, trigger = ícono History de Lucide)
└── Lista de entradas (más reciente primero)
    └── Item
        ├── Border-left: 2px solid --inc-violet
        ├── Badge `locked` (rol anterior) → Badge `active` (rol nuevo)
        └── Fecha + "por {nombre del admin}" (--edu-text-muted, 12px)
```

Si no hay conversiones, mensaje simple: "Sin conversiones registradas todavía."

---

## 16. ConvertRoleModal

Modal de conversión de rol (Admin → `/admin/usuarios`, por fila de la tabla). Ver Spec v3.4
CU-T04/CU-T05/CU-T06 y ADR-15/ADR-16.

### Estructura interna

```
ConvertRoleModal (Dialog, content raised)
├── Header: "Convertir rol — {nombre}" + Badge con el rol actual
├── Select "Nuevo rol" (los 6 valores de user_role)
├── Si nuevo rol = alumno:
│   ├── Select "Carrera" (public.careers, obligatorio)
│   └── Input "DNI" (obligatorio)
└── Footer: Button outline "Cancelar" + Button primary "Confirmar conversión"
```

**Regla:** la carrera y el DNI solo se piden (y solo se envían al backend) cuando el rol
destino es `alumno` — reflejo de ADR-15 (las carreras las asigna el Admin como matrícula
real). La conversión es aditiva: nunca se pierde el historial previo.

---

## 17. FilterBar

Barra de filtros del catálogo de cursos (`/cursos`). Ver Spec v3.4 §5.3.

### Especificación

```
FilterBar
├── Chips de carrera (una por public.careers.activa=true + "Todas")
│   ├── Inactivo: fondo transparente, border --edu-border, texto --edu-text-muted
│   └── Activo: fondo --inc-violet-subtle, border --inc-violet-border, texto --inc-violet-text
└── Select "Nivel" (básico / intermedio / avanzado / todos) — mismos tokens que Input (§4)
```

Los chips reusan la forma de `Badge` (`pill: true`) como elemento clickeable, no como
estado read-only. Filtra por carrera real, no por una categoría fija — un curso no tiene
columna `categoria` en el schema (`courses`/`careers` de `001_educativa_core.sql`); su
"categoría" de catálogo es la carrera a la que pertenece (`carrera_id`).

---

## 18. EnrollButton

Botón de inscripción a curso — cambia de variante según el estado de la inscripción del
alumno. Ver CU-T01 (Spec v3.4 §10.3).

| Estado | Variante | Label | Extra |
|---|---|---|---|
| Rol distinto de `alumno` | `Badge state="locked"` | "Vista previa — inscripción disponible para alumnos INCADE" | Sin botón de acción |
| No inscripto, gratuito | `primary` | "Inscribirme gratis" | — |
| No inscripto, pago | `primary` (disabled + tooltip) | "Disponible en Etapa 3" | Pagos son E3 |
| Inscripto, en progreso | `outline` | "Continuar" | `Progress` inline con % |
| Completado (100%) | `ghost` + `Badge state="completed"` | "Ver certificado" | Certificados: Sprint 9-10 |

---

## 19. CourseDetail

Página de detalle de curso (`/cursos/[slug]`). Solo información de catálogo — el player de
contenido (lecciones) es un sprint aparte (Sprint 5-6).

### Estructura interna

```
CourseDetail
├── Header
│   ├── CategoryTag + Badge de nivel (básico/intermedio/avanzado)
│   ├── CourseTitle (20px SemiBold)
│   ├── Descripción (--edu-text-muted)
│   └── Meta: duración (Clock, Lucide) · gratuito/pago
├── EnrollButton (§18)
└── "Contenido del curso" — lista de módulos (solo títulos, sin desglose de clases)
```

---

## 20. CareerMap

Mapa visual de una carrera (`/carreras/[slug]`) — solo visible en su forma completa para
rol `alumno` (ADR-15). Ver FUNCIONALIDADES §8.4.

### Especificación

```
CareerMap
└── Path vertical de nodos (uno por curso de la carrera, en orden)
    ├── Nodo `completado`: círculo relleno --edu-success, ícono Check
    ├── Nodo `activo` (siguiente disponible): círculo --inc-violet, borde animado sutil
    ├── Nodo `bloqueado`: círculo outline --edu-text-faint, ícono Lock
    └── Conector entre nodos: línea 2px --edu-border-neutral (--edu-success si el tramo
        anterior está completo)
```

Nodo final de una carrera 100% completa: `CertificateCard` (§10) con tokens dorado — único
lugar fuera de "Mis certificados" donde aparece `--edu-gold`.

`public.careers` no tiene columna de "salida laboral" — solo `nombre`/`descripcion`. No se
agregó por schema para este alcance; si hace falta, es una columna a sumar en una migración
aparte, no algo que se derive del catálogo actual.

---

## 21. CareerBlockedCTA

Vitrina de carrera para roles que no son `alumno` (`comunidad`, `lead`, y por defecto
cualquier rol sin matrícula). Ver CU-T02, ADR-15.

### Especificación

```
CareerBlockedCTA
├── Descripción de la carrera (`careers.descripcion`) — mismo contenido que CareerMap,
│   sin el mapa de nodos ni progreso
├── NotificationBanner type="info": "Esta carrera requiere matrícula presencial en INCADE"
└── Button primary: "Inscribite en el Instituto" (NUNCA "Comprar" — ADR-15)
    → enlace a información de admisiones, no a un flujo de pago
```

---

## 22. CareerForm / CareerModal

Alta y edición de carreras (Admin → `/admin/carreras`). CRUD mínimo top-level — sin editor
de módulos/clases (eso es `CourseEditor`, Sprint 7-8).

### Estructura interna

```
CareerModal (Dialog, content raised)
├── Header: "Nueva carrera" / "Editar carrera — {nombre}"
├── Input "Nombre" (obligatorio)
├── Input "Slug" (autogenerado desde Nombre, editable a mano)
├── Textarea/Input "Descripción"
├── Input "Imagen (URL)" (opcional)
├── Switch/checkbox "Activa"
└── Footer: Button outline "Cancelar" + Button primary "Guardar carrera"
```

Mismo patrón de Dialog + Server Action que `ConvertRoleModal` (§16). El slug se genera con
`src/lib/slugify.ts` y es editable antes de guardar; un conflicto de unicidad (constraint
`unique` de `careers.slug`) se muestra como error de formulario, no como excepción.

---

## 23. CourseForm / CourseModal

Alta y edición de cursos (Admin → `/admin/cursos`). Solo el registro top-level del curso
(título, carrera, docente, nivel, precio, estado) — la estructura de módulos/clases se
carga en Sprint 7-8 con `CourseEditor`.

### Estructura interna

```
CourseModal (Dialog, content raised)
├── Header: "Nuevo curso" / "Editar curso — {titulo}"
├── Input "Título" (obligatorio)
├── Input "Slug" (autogenerado desde Título, editable a mano)
├── Textarea/Input "Descripción"
├── Select "Carrera" (public.careers, opcional — un curso puede no tener carrera)
├── Select "Docente" (users con role='docente' o can_teach=true, opcional)
├── Select "Nivel" (básico / intermedio / avanzado)
├── Input "Duración (hs)"
├── Checkbox "Es gratuito" → si se desmarca, habilita Input "Precio"
└── Footer: Button outline "Cancelar" + Button primary "Guardar curso"
```

**Publicación:** en la tabla de `/admin/cursos`, cada fila tiene un botón
"Publicar"/"Volver a borrador" separado del modal de edición (cambia solo `estado`, vía
`setCourseEstadoAction`) — el Admin es quien publica directamente (regla crítica #1, es
quien cura el contenido).

---

## 24. LessonSidebar / LessonNav

Navegación de lecciones dentro de un curso (`/cursos/[slug]/lecciones/[leccionId]`).
Ver FUNCIONALIDADES §8.1 (desbloqueo progresivo).

### Estructura interna

```
LessonSidebar (sin "use client" — son <Link>, no hace falta usePathname)
└── Por módulo: título + lista de lecciones
    └── Por lección
        ├── `completado`: círculo --edu-success, ícono Check
        ├── `activa` (la que se está viendo): círculo --inc-violet
        ├── `bloqueada`: círculo outline --edu-text-faint, ícono Lock, sin <Link> (span)
        └── resto (desbloqueada, no vista): número, <Link> normal

LessonNav
├── Button outline "Anterior" (<Link>, disabled si no hay lección previa)
└── Button primary "Siguiente" (<Link>, disabled si la siguiente está `bloqueada`)
```

**Regla de desbloqueo:** la primera lección publicada del curso siempre está desbloqueada;
cada lección siguiente se desbloquea solo si la anterior tiene `lesson_progress.completada =
true`. Se calcula en el server component de la página, no en el componente.

`CompletionBadge` **no es un componente nuevo** — es `Badge state="completed"` (§3) usado
directamente donde haga falta marcar una lección/curso completado.

---

## 25. LessonPlayer

Reproductor de video de una lección (`tipo='video'`). Ver FUNCIONALIDADES §8.1.

### Especificación

```
LessonPlayer ("use client")
└── <video> HTML5, controles nativos, src = URL firmada de Storage (contenido-cursos)
    ├── Al cargar metadata: si hay progreso previo, currentTime = tiempo_visto_seg
    ├── onTimeUpdate: guarda progreso debounced (~10s) vía saveLessonProgressAction
    └── onEnded: guarda progreso + completada=true
```

No tiene controles custom en esta etapa — controles nativos del navegador. El guardado de
progreso nunca escribe `enrollments.progreso_pct` a mano: lo recalcula el trigger
`trg_progress_recalc` (001) al hacer upsert en `lesson_progress`.

---

## 26. ContentViewer

Visor de contenido no-video de una lección (`tipo='texto'` o `tipo='documento'`).

### Estructura interna

```
ContentViewer ("use client", por el botón de completar)
├── tipo='texto': texto plano de `lessons.contenido_text` (--edu-text, 14px, lh 1.65)
├── tipo='documento': Button outline "Descargar material" → URL firmada de Storage
└── Button primary "Marcar como completada" (guarda completada=true — no hay señal
    automática de "visto" para estos tipos, a diferencia del video)
```

---

## 27. CourseEditor

Editor de estructura del curso para el Docente (`/docente/cursos/[id]`). Sprint 7a.

### Estructura interna

```
CourseEditor ("use client")
├── Header: título del curso + Badge de estado + Button "Enviar a revisión"
│   (solo visible en estado='borrador')
├── NotificationBanner warning: motivo de rechazo (revision_comentario), solo si
│   estado='borrador' y hay un comentario del Admin de una revisión anterior
├── NotificationBanner info: "en revisión, no editable" si estado='revision'
├── DndContext (@dnd-kit) + SortableContext vertical de ModuleCard
│   └── ModuleCard (por módulo)
│       ├── drag handle + título + ModuleModal (editar) + borrar (confirm en 2 pasos)
│       ├── DndContext + SortableContext vertical anidado de clases del módulo
│       │   └── por clase: drag handle + ícono según tipo + título + LessonModal + borrar
│       └── LessonModal trigger "+ Clase"
└── ModuleModal trigger "+ Módulo"
```

**Regla de edición:** todos los controles de edición (agregar/editar/borrar/arrastrar) se
ocultan cuando `estado !== 'borrador'` — mientras el curso está en revisión o publicado, el
Docente ve la estructura pero no puede tocarla (RLS ya lo impide a nivel DB para `courses`,
pero `modules`/`lessons` sí aceptan escritura del dueño en cualquier estado, así que el
gating real de UX vive acá, no en RLS).

`ModuleModal` y `LessonModal` son diálogos (Dialog, §12) con un solo campo — no ameritan
entrada propia en este catálogo.

---

## 28. LessonUploader

Sube el archivo de una clase (`video` o `documento`) directo a Storage desde el browser.
Sprint 7a — usa por primera vez el cliente de Supabase de browser (`lib/supabase/client.ts`),
necesario porque subir un archivo grande a través de un Server Action no escala.

```
LessonUploader ("use client")
├── Ruta del objeto: `{course_id}/{timestamp}-{filename-sanitizado}` (misma convención
│   del bucket `contenido-cursos` de la 006)
├── Progress (§5): barra simulada (no hay callback de progreso por byte en supabase-js
│   Storage) — sube hasta 90% mientras la promesa está pendiente, cierra a 100% al resolver
└── Al confirmar: llama `onUploaded(path)` — el path (no la URL firmada) es lo que se
    persiste en `lessons.contenido_url`; la URL firmada se genera recién al reproducir/descargar
```

Requiere las policies `lesson_content_write/update/delete` de la migración 007 (la 006 solo
tenía SELECT).

---

## 29. ReviewActions

Acciones de revisión del Admin para un curso en `estado='revision'` (`/admin/cursos`).
Reemplaza a `PublishToggle` (§ver `PublishToggle`) solo para esa fila — `PublishToggle` sigue
disponible para borrador↔publicado directo en cursos que el Admin arma sin pasar por un Docente.

```
ReviewActions ("use client")
├── Button primary "Aprobar" — 1 clic, estado→publicado, limpia revision_comentario
└── Button destructive "Rechazar" → Dialog con textarea de motivo (obligatorio)
    → estado→borrador, guarda revision_comentario/revisado_por/revisado_at
```

El motivo de rechazo es el *último* nomás (se pisa en cada revisión), no un historial
completo — alcanza para el nivel "básico" pedido en el plan de sprint. El Docente lo lee
directo en `CourseEditor` (§27); no depende del bell de notificaciones (Sprint 7c, no
construido todavía).

---

## 30. EvaluationBuilder

Editor visual de una evaluación (`/docente/cursos/[id]/evaluaciones/[evaluationId]`), página
completa (no modal — el contenido crece rápido con varias preguntas). Sprint 7b, Addendum 01.
Misma entidad `evaluations` para los 3 contextos (`cuestionario_modulo` / `examen_final` /
`tp`, ADR-12) — un único editor genérico, el `tipo` solo determina dónde aparece en la
jerarquía del curso (§ ver integración en `CourseEditor`, §27).

### Estructura interna

```
EvaluationBuilder ("use client")
├── Header: Link "← Volver al curso" + Badge tipo + Input título + peso total (suma de
│   `peso` de las preguntas, informativo — no bloquea el guardado si no suma 100)
├── Card "Configuración" — tiempo límite (min, vacío = sin límite), nota mínima (%, default
│   60), intentos permitidos, espera entre intentos (hs), mostrar resultado
│   (inmediato/diferido) → persiste en `evaluations.config` (jsonb) + `nota_minima`
├── "+ Agregar pregunta" — fila de 5 botones outline con ícono Lucide (uno por tipo), cada
│   clic agrega la pregunta directo al final de la lista (1 clic, no hay menú/popover
│   intermedio — cumple el criterio de aceptación "< 3 clics por pregunta" del sprint)
├── DndContext (@dnd-kit) + SortableContext vertical de QuestionBlock (§31)
└── Button primary "Guardar cambios" (persiste `preguntas` completo + config + nota_minima
    en un solo update) + Button destructive "Eliminar evaluación" (confirm en 2 pasos)
```

**Regla de edición:** igual que `CourseEditor`, todos los controles se ocultan si
`course.estado !== 'borrador'` — el gating vive en la página, no en RLS (`evaluations_write`
permite escritura del docente dueño en cualquier estado del curso).

**Simplificación documentada:** el enunciado de la pregunta es un `textarea` de texto plano,
no un editor de texto enriquecido (el Addendum 01 §3 pedía negrita/listas/imágenes) — no hay
dependencia de rich-text en el proyecto todavía y no ameritaba sumar una para el MVP. Si se
necesita, es una mejora incremental sobre el mismo campo `enunciado` (string), no un cambio de
schema.

---

## 31. QuestionBlock

Bloque de edición de una pregunta dentro de `EvaluationBuilder` (§30). Una sola pieza con 5
variantes según `tipo` — no son 5 componentes separados, sino un `switch` interno sobre los
campos propios de cada tipo. Addendum 01 §2.

```
QuestionBlock ("use client", sorteable — igual que LessonRow en CourseEditor)
├── Header: drag handle + ícono Lucide del tipo + Badge tipo + Input peso (número) +
│   borrar (confirm en 2 pasos)
├── Textarea enunciado (compartido por los 5 tipos)
└── Campos propios por tipo:
    ├── vf_fundamentada: toggle Verdadero/Falso (respuesta correcta) + Input número
    │   "mínimo de caracteres para fundamentar"
    ├── opcion_unica: lista de opciones (Input por opción, 2-6, + agregar/quitar) + radio
    │   para marcar la correcta + Textarea "retroalimentación" (opcional)
    ├── opcion_multiple: misma lista de opciones + checkbox para marcar correctas (varias) +
    │   Select "proporcional" / "todo o nada"
    ├── abierta: sin campos propios — corrección 100% manual (Sprint 9-10)
    └── entrega_tp: checkboxes de tipos de entrega aceptados (archivo / Drive / GitHub / URL
        externa / texto en plataforma) — mapea a `submission_kind` de la 003
```

Los íconos por tipo (Lucide): `CheckCircle2` (V/F), `CircleDot` (opción única), `ListChecks`
(opción múltiple), `MessageSquareText` (abierta), `UploadCloud` (entrega TP).

---

## 32. NotificationBell / NotificationPanel

Campana de notificaciones en `Topbar` (§7), visible para cualquier usuario logueado. Sprint 7c,
Addendum 02. Dos componentes porque la campana (ícono + badge, siempre montada) y el panel
(contenido, solo montado mientras está abierto) tienen ciclos de vida distintos.

```
NotificationBell ("use client")
├── Ícono Lucide `Bell` + Badge pill con la cantidad de no leídas (oculto si es 0)
├── Al montar: cuenta no leídas del usuario (`notifications` donde user_id=propio y leida=false)
├── Suscripción Supabase Realtime (`postgres_changes`, INSERT en `public.notifications`
│   filtrado por `user_id=eq.<uid>`) — incrementa el badge en vivo sin recargar la página
│   (requiere migración 008, `alter publication supabase_realtime add table notifications`)
└── Al click: abre/cierra NotificationPanel (posicionado debajo, mismo patrón que un Dialog
    pero anclado, no modal — no bloquea el resto de la pantalla)

NotificationPanel ("use client", hijo de NotificationBell)
├── Fetch de las últimas ~20 notificaciones del usuario al abrir
├── Por ítem: Badge tipo (§ NOTIFICATION_TYPE_LABEL) + preview del cuerpo (80 caracteres) +
│   tiempo relativo ("hace 5 minutos") + punto violeta si no está leída
├── Click en un ítem: marca como leída (`markNotificationReadAction`) + navega al origen
│   (anuncio → `/cursos/[slug]`, revisión de curso → `/docente/cursos/[id]`)
└── Button "Marcar todas como leídas" (`markAllNotificationsReadAction`)
```

**Simplificación documentada:** el link de "navegar al origen" solo está resuelto para los dos
tipos que este sprint produce (`announcement` → curso del alumno, `contenido_publicado`/`sistema`
de revisión → curso del docente). Los demás tipos del enum (`tutoria`, `correccion`,
`certificado`, `puntos`, `pago`) todavía no tienen productor — quedan sin link hasta que se
implementen en Sprint 9-10 / Etapa 2, mostrando el ítem sin navegación.

---

## 33. AnnouncementComposer

Formulario para que el Docente (o Admin/Coordinador) publique un anuncio en un curso.
`/docente/cursos/[id]/anuncios`. Sprint 7c, Addendum 02 §1.

```
AnnouncementComposer ("use client")
├── Input título (opcional)
├── Textarea body (obligatorio)
├── Input URL de adjunto (opcional — link, no upload de archivo)
└── Button primary "Publicar anuncio" → `createAnnouncementAction`: inserta el anuncio,
    resuelve los inscriptos del curso y dispara `notifyUsers()` (in-app + email Resend)
```

**Simplificación documentada:** el Addendum 01/02 pide editor de texto enriquecido
(negrita/listas/imágenes) y adjunto por upload — igual que en `EvaluationBuilder` (§30), se
usa texto plano + URL para no sumar una dependencia de rich-text al MVP. Mejora incremental
futura sobre el mismo campo `body` (string), no un cambio de schema.

---

## 34. AnnouncementList

Historial de anuncios de un curso, en orden cronológico inverso. Se reusa en dos contextos:
`/docente/cursos/[id]/anuncios` (vista del Docente, sin estado de lectura) y en
`/cursos/[slug]` (vista del Alumno inscripto, con indicador leído/no leído). Sprint 7c,
Addendum 02 §3.

```
AnnouncementList ("use client" — recibe los anuncios ya resueltos por la página, necesita
interactividad para marcar como leído al click)
├── Por anuncio: nombre del remitente + fecha + título (si tiene) + body + link de adjunto
├── Si `readAnnouncementIds` viene definido (vista Alumno): punto violeta en los no leídos,
│   el ítem completo es un botón que marca como leído al click (`markAnnouncementReadAction`)
└── Si `showMarkAllRead` (vista Alumno): Button "Marcar todos como leídos"
    (`markAllAnnouncementsReadAction`)
```

---

## 35. NotificationPrefsToggle

Preferencias de canal de notificación del usuario, en `/dashboard`. Sprint 7c, Addendum 02 §2.3.

```
NotificationPrefsToggle ("use client")
├── Toggle "Email" — persiste en `users.notification_prefs.email`
├── Toggle "WhatsApp" — persiste en `users.notification_prefs.whatsapp` (canal no operativo
│   todavía, Twilio es Etapa 2 — el toggle ya queda funcional para cuando se active)
└── In-app: texto fijo "siempre activo", sin toggle (no desactivable, regla del Addendum 02 §2.3)
```

No hay componente `Switch` en el catálogo (§1-31) — se implementa con un `<button>` simple
con dos estados de fondo (violeta/gris), mismo patrón que los pills de tipo de entrega en
`QuestionBlock` (§31), no ameritaba sumar Radix Switch para dos toggles.

---

## 36. EvaluationPlayer / QuestionAnswer

Render y resolución de una evaluación por el Alumno. Sprint 9-10, Addendum 01 §7.
`/cursos/[slug]/evaluaciones/[evaluationId]`.

```
EvaluationPlayer ("use client")
├── Header: Badge tipo + título + countdown (mm:ss) si `config.tiempo_limite_min` —
│   al llegar a 0 dispara el submit automáticamente con las respuestas actuales
├── Si el intento ya es terminal (no 'en_curso'): NotificationBanner con el
│   resultado — inputs deshabilitados, no se puede reenviar
├── Lista de QuestionAnswer (uno por pregunta, mismo orden que armó el docente)
└── Button "Entregar evaluación" → `submitAttemptAction` (corrección automática +
    si no queda nada manual: award +25 pts y check de certificado in-line)

QuestionAnswer ("use client", switch por tipo — igual patrón que QuestionBlock §31
pero para responder, no para autorar)
├── vf_fundamentada: toggle V/F + textarea fundamentación
├── opcion_unica: lista de opciones clickeables (radio visual)
├── opcion_multiple: lista de opciones clickeables (checkbox visual)
├── abierta: textarea libre
└── entrega_tp: pills de tipo de entrega + campo según tipo (texto → textarea,
    drive/github/url → Input con placeholder, archivo → TpFileUploader §37)
```

**Simplificación documentada:** `mostrar_resultado` (inmediato/diferido) solo tiene
efecto real cuando la evaluación es 100% auto-corregible (ahí el resultado siempre es
inmediato, no hay nada que diferir). Si hay alguna pregunta de corrección manual
(V/F fundamentado, abierta, entrega de TP), el resultado queda `pendiente_correccion`
hasta que el docente corrija, sea cual sea el valor de `mostrar_resultado` — coincide
con el comportamiento "diferido" en ambos casos, no se implementó un modo donde el
alumno vea un score parcial mientras espera la corrección.

---

## 37. TpFileUploader

Sube el archivo de una entrega de TP (tipo "archivo") directo a Storage desde el
browser. Mismo patrón que `LessonUploader` (§28) — cliente de browser, progress
simulado, bucket privado nuevo `entregas-tp` (migración 009), ruta
`{evaluation_id}/{user_id}/{archivo}`.

---

## 38. CorrectionPanel

Corrección manual del docente para un intento en `pendiente_correccion`. Sprint 9-10,
Addendum 01 §4. Vive en la misma página que `EvaluationBuilder` (§30), debajo de las
preguntas, visible para cualquier estado del curso (a diferencia del editor, que solo
es editable en `borrador` — las correcciones pasan siempre, con el curso publicado).

```
CorrectionPanel ("use client")
├── Lista de intentos `pendiente_correccion` de esta evaluación — nombre del alumno
│   (vía vista `course_students`, RLS-03 de la 005) + fecha de entrega
├── Por intento: muestra solo las respuestas de preguntas manuales (V/F fundamentado
│   → la fundamentación; abierta → el texto; entrega_tp → link o archivo firmado)
│   junto con el peso manual disponible (informativo)
├── Input nota_parcial (0 a 100−score_auto) + Textarea comentario/devolución
└── Button "Guardar corrección" → `correctAttemptAction`: INSERT en
    `manual_corrections` (el trigger `apply_manual_correction`, 003, integra
    score_auto+nota_parcial → `nota`/`aprobado`/`estado='corregida'`) — si queda
    `aprobado=true`, la action dispara +25 pts y el check de certificado
```

## 39. EvaluationResults

Panel de resultados por evaluación para el docente/admin. Sprint 9-10, Addendum 01 §5.
Misma página, sección aparte.

```
EvaluationResults (server component)
├── Tabla: alumno, nota, estado (aprobado/desaprobado/pendiente), fecha del último intento
└── Promedio del grupo (solo intentos con nota no nula)
```

**Simplificación documentada:** no se implementó filtro por estado ni exportación a
CSV en esta pasada (Addendum 01 §5 los pedía) — la tabla ya cubre el caso de uso
principal (ver quién aprobó y con qué nota); quedan como mejora incremental sobre el
mismo componente, no requieren cambio de schema.

---

## 40. CertificateVerifier / Mis certificados

Página pública de verificación (`/verificar/[uuid]`, sin sesión — ya está en
`PUBLIC_PATHS` de `middleware.ts`) y sección "Mis certificados" del alumno
(`/certificados`). Sprint 9-10.

```
CertificateVerifier (server component, cliente anon — RPC verify_certificate, 001)
└── Si existe: nombre completo + curso + fecha de emisión + Badge de estado
    (emitido/revocado). Si no existe: mensaje "certificado no encontrado"
    — nunca un SELECT directo a `certificates` (regla crítica #5 de CLAUDE.md)

CertificateCard (server component, listado en /certificados)
├── Por certificado: curso, fecha, Badge estado
└── Link "Descargar PDF" → URL firmada de Storage (bucket `certificados`,
    migración 009), generada en la propia page con el cliente de sesión normal
    (la policy `certificate_select` ya permite al dueño leer su propio objeto)
```

La emisión del PDF (no un componente de UI) vive en `src/lib/certificatePdf.tsx`
(`@react-pdf/renderer` + `qrcode`) y `src/lib/certificates.ts`
(`checkAndIssueCertificate`, cliente admin — la policy `certs_admin_write` de la 001
solo permite escribir a `is_admin()`, nunca al propio alumno). El certificado en PDF
usa fondo claro (pensado para imprimir), no el dark mode exclusivo del resto de la
plataforma — excepción documentada, es un documento descargable, no una pantalla.

---

## 41. PointsHistory

Historial de puntos del alumno. Sprint 9-10. Se agregó como sección en `/dashboard`
(no se creó una ruta nueva — mismo criterio que `NotificationPrefsToggle`, §35).

```
PointsHistory (server component)
├── Total acumulado (`users.puntos`, cacheado por `award_points()`, 005)
└── Últimos movimientos del ledger `points_log` (motivo + puntos + fecha)
```

---

## 42. LocationModal / SpaceModal (admin Coworking)

CRUD de sedes y espacios del módulo Coworking. Sprint 11-12 (Etapa 2), Addendum 03 §5.3.
Mismo patrón exacto que `CareerModal`/`CourseModal` (§22-23): Dialog (§12) con un form
`FormData` + server action, sin estado propio más allá del form.

```
LocationModal ("use client") — /admin/coworking/sedes
├── Input nombre, Input dirección, checkbox "Activa"
└── Button "Guardar sede" → createLocationAction / updateLocationAction

SpaceModal ("use client") — /admin/coworking/espacios
├── Select sede (`locations` activas), Input nombre, Select tipo
│   (hot_desk / sala_reunion / aula), Input capacidad, Input precio por hora,
│   Input descripción, Input imagen (URL), checkbox "Activo"
└── Button "Guardar espacio" → createSpaceAction / updateSpaceAction
```

`ActiveToggle` no se creó como componente aparte — se reusa el patrón inline de
`PublishToggle` (§ ver `PublishToggle`) directamente en cada fila de las tablas de
sedes/espacios (`toggleLocationActiveAction`/`toggleSpaceActiveAction`).

---

## 43. CoworkingLanding / SpaceCard

Landing pública del Coworking, `/servicios/coworking` — **fuera** del grupo `(dashboard)`
adrede: el Addendum 03 §1.1/§2.1 exige acceso sin login (el árbol de carpetas de
`CLAUDE.md` lo lista bajo `(dashboard)/servicios/`, pensado antes de integrarse el
addendum; se prioriza el requisito explícito del addendum — decisión documentada, no
un cambio de `CLAUDE.md`). Layout propio minimalista (mark "IN" + link a
`/dashboard` o `/login` según sesión), no el `DashboardLayout` con sidebar.

```
CoworkingLanding (server component)
├── Selector de sede (tabs o Select — solo sedes `activa=true`)
├── Grilla de SpaceCard de la sede elegida (solo `activo=true`)
└── Si hay sesión con rol alumno/docente/coordinador: precio ya calculado con el
    descuento institucional (`get_user_discount()` RPC, 002) — precio original
    tachado + precio final, igual que pide el Addendum 03 §4

SpaceCard (server component)
├── Imagen (o placeholder con ícono Lucide por `tipo`), nombre, Badge tipo,
│   capacidad (ícono Users)
├── Precio por hora (tachado + con descuento si corresponde)
└── Button "Reservar" → `/servicios/coworking/reservar/[spaceId]` (BookingForm,
    §44 — agregado en Sprint 13-14)
```

---

## 44. BookingForm (reserva pública de Coworking)

Flujo de reserva de un espacio, CU-06 del spec (Addendum 03 §3-4). Sprint 13-14.
Página `/servicios/coworking/reservar/[spaceId]` (fuera de `(dashboard)`, mismo
layout público que `CoworkingLanding`, §43). Todo en una sola pantalla para cumplir
el criterio de "menos de 5 pasos" del addendum: seleccionar día → seleccionar
horario → (si no hay sesión) registro mínimo → confirmar y pagar.

```
BookingForm ("use client") — recibe space/location/discountPct/user como props
├── Selector de día: chips horizontales, próximos 14 días (mismo patrón visual
│   que el selector de sede de CoworkingLanding — pill activa violeta)
├── Grilla de horarios del día elegido (franja fija 08:00–22:00, slots de 1hs)
│   ├── Ocupación vía RPC `get_occupied_slots()` (security definer, migración
│   │   013) — NO se consulta `bookings` directo: su RLS ("bookings_own", 002)
│   │   solo deja ver la reserva propia, así que un alumno/comunidad no vería
│   │   los horarios que OTRO usuario ya tomó del mismo espacio (bug real
│   │   encontrado en verificación de navegador). La función devuelve
│   │   únicamente fecha_inicio/fecha_fin de reservas activas, sin monto,
│   │   teléfono ni user_id de nadie
│   ├── Suscripción Realtime a `bookings` filtrado por `space_id` (migración
│   │   011) + polling cada 20s como respaldo — el canal de Supabase solo
│   │   entrega el evento si la RLS de esa fila es visible para el usuario
│   │   conectado (refresca al instante los cambios propios, ej. otra
│   │   pestaña), por eso el polling cubre los cambios de otros usuarios sin
│   │   necesitar abrir la RLS de `bookings` (que expondría datos ajenos)
│   ├── Slot disponible → Button variante ghost, clickeable
│   └── Slot ocupado (estado pendiente/confirmada/en_uso solapado) → disabled,
│       Badge state="error" "Ocupado"
├── Selector de duración (1 a 4 horas, stepper simple)
├── Resumen: precio por hora × duración; si `discountPct > 0` (usuario
│   alumno/docente/coordinador logueado, `get_user_discount()`), precio original
│   tachado + precio final — mismo patrón visual que SpaceCard (§43)
├── Si NO hay sesión: fieldset "Creá tu cuenta para reservar" — Input nombre,
│   Input email, Input contraseña (registro mínimo, CU-06 paso 4 — ver
│   excepción acotada de CLAUDE.md regla #2 v3.5). Si hay sesión, no se muestra.
└── Button "Reservar y pagar" → `createBookingAction` (server action):
    registra al usuario si hace falta, inserta la reserva (`estado=pendiente`,
    el exclusion constraint `no_overlap` de la 002 es la garantía real
    anti-doble-reserva, la grilla del cliente es solo UX), crea la preferencia
    de MercadoPago y redirige al checkout. Si `MP_ACCESS_TOKEN` no está
    configurada (dev sin credenciales), la reserva queda `pendiente` igual y
    redirige a la página de confirmación con un aviso de que el pago no está
    disponible en este entorno — mismo criterio de degradación que Resend.
```

No hay componente de calendario mensual completo (tipo date-picker de grilla) —
simplificación documentada: 14 días en chips es suficiente para el caso de uso
(reservar coworking con antelación corta) y evita sumar una librería de fechas
nueva. Mejora incremental futura si se necesita reservar con más antelación.

---

## 45. BookingConfirmation (estado de la reserva + QR)

Página `/servicios/coworking/reservas/[bookingId]` — a la que redirige MercadoPago
tras el pago (`back_urls`) y también el flujo sin MP configurado. Requiere sesión
(la RLS `bookings_own` de la 002 ya solo deja ver la reserva al dueño o al admin);
si no hay sesión, redirect a `/login`.

```
BookingConfirmation (server component)
├── Datos de la reserva: espacio, sede, fecha/horario, monto, tipo_descuento
├── Badge de estado (`pendiente` amarillo / `confirmada` verde / `cancelada` rojo)
├── Si `estado='pendiente'` y hay `payments.mp_preference_id`: aviso "esperando
│   confirmación del pago" (el webhook es la única fuente de verdad, CLAUDE.md
│   regla #9 — esta página nunca marca la reserva como confirmada por su cuenta)
├── Si `estado='pendiente'` sin preferencia MP (entorno sin `MP_ACCESS_TOKEN`):
│   aviso explícito "Pago no disponible en este entorno de desarrollo"
└── Si `estado='confirmada'`: QR de acceso, generado on-the-fly con `qrcode`
    (mismo paquete que `certificatePdf.tsx`, sin persistir imagen — el check-in
    por QR recién lee este código en Sprint 15-16) + botón "Ver mis reservas"
```

---

## 46. OccupancyDashboard (admin Coworking)

Página `/admin/coworking/ocupacion`. Sprint 15-16, Addendum 03 §5.1.

```
OccupancyDashboard ("use client") — recibe spaceStatuses/todaysBookings/
occupancy/noShowAlerts ya calculados server-side desde page.tsx
├── 4 tiles: ocupación hoy/7 días/mes, alertas de no-show
├── Botón "Detectar no-shows ahora" → runNoShowDetectionAction()
│   (detect_no_shows() ya existe desde la 002; sin cron real todavía —
│   Sprint 17-18, disparo manual por ahora)
├── Mapa de espacios: card por espacio con Badge ocupado (error) / disponible
│   (completed) / bloqueado (locked, = space.activo=false)
└── Table "Reservas de hoy" (mismo primitive que el resto del admin)

Realtime: canal sobre `bookings` (sin filtro, el admin ve todo vía RLS
is_admin()) + polling 20s de respaldo — mismo patrón que BookingForm (§44).
```

---

## 47. Reservas admin — BookingFilterBar / BookingRowActions / ManualBookingModal

Página `/admin/coworking/reservas`. Sprint 15-16, Addendum 03 §5.2. "Lista del
día": el filtro `fecha` es hoy por defecto (link "Ver todas las fechas" lo saca).

```
BookingFilterBar ("use client") — fecha/estado/espacio/tipo vía searchParams,
mismo patrón que FilterBar (§ catálogo de cursos)

BookingRowActions ("use client") — por fila: "Presente"
(checkInBookingAction(id,'manual'), solo si estado=confirmada) + "Cancelar"
(confirm + cancelBookingAction, dispara notifyUsers tipo 'reserva')

ManualBookingModal ("use client") — Dialog, mismo patrón que LocationModal:
buscador de usuario existente (filtro en memoria sobre la lista ya cargada,
sin componente Select nuevo) + espacio/fecha/hora/duración + notas →
createManualBookingAction (tipo_descuento='manual', estado='confirmada'
directo, sin pasar por MercadoPago)
```

---

## 48. CheckInScannerModal

Modal de check-in por QR, botón "Escanear QR" en `/admin/coworking/reservas`.
Sprint 15-16, Addendum 03 §5.2 (±15 min de margen, estado CONFIRMADA
requerido — validado en `checkInBookingAction`, no en el cliente).

```
CheckInScannerModal ("use client") — nueva dependencia `html5-qrcode`
(única lectora de QR del repo, no había ninguna)
├── Cámara (facingMode "environment") decodificando el booking.id plano
│   (mismo QR ya generado en BookingConfirmation, §45)
└── Input de respaldo para pegar/tipear el ID a mano — la lectura por cámara
    es difícil de verificar con la automatización de navegador (mismo
    problema ya documentado con la subida de archivos en Sprint 7a); el
    respaldo deja probable la lógica de negocio sin depender de la cámara
```

---

## 49. RevenuePanel — RevenueFilterBar / RevenueExportButton

Página `/admin/coworking/ingresos`. Sprint 15-16, Addendum 03 §5.4. Consume
la vista `coworking_revenue` (ya existía desde la 002, nunca tenía UI).

```
RevenueFilterBar ("use client") — mes (input type=month, con "Ver todos los
períodos") + sede + tipo, mismo patrón searchParams que BookingFilterBar

RevenueExportButton ("use client") — arma el CSV en el browser con buildCsv()
(src/modules/admin/bookings.ts, no hay librería de export en el repo) y
descarga vía Blob — sin endpoint nuevo
```

**Simplificación documentada:** la vista `coworking_revenue` agrupa por mes
(`date_trunc('month', ...)`, decisión de schema de la migración 002, no
tocada en este sprint) — el filtro de período es por mes, no por día/semana
como sugiere el Addendum en detalle; si se necesita ese grano más fino más
adelante, es un cambio aditivo a la vista.

---

## 50. MembershipPlanCard / admin MembershipPlanModal

Planes de membresía de Coworking (mensual/anual con créditos). Sprint 17-18.

```
MembershipPlanModal / MembershipPlanActiveToggle ("use client", admin) —
/admin/coworking/membresias, mismo patrón exacto que LocationModal/
LocationActiveToggle (§42): Dialog con form + server action
(membershipPlanActions.ts), Table con nombre/tipo/precio/créditos/estado.

MembershipPlanCard (server component) — /servicios/coworking/membresia,
mismo patrón visual que SpaceCard (§43): tipo (Badge), nombre, créditos
incluidos, precio, botón "Suscribirme" → /servicios/coworking/membresia/[planId]
```

---

## 51. MembershipSubscribeForm / MembershipStatus

Flujo de suscripción (pago recurrente MP) y estado de membresía. Sprint 17-18.
**A diferencia de la reserva de espacios, este flujo requiere sesión** — la
excepción de auto-registro de CLAUDE.md regla #2 es específica de CU-06
(reserva), no aplica acá.

```
/servicios/coworking/membresia/[planId] — confirma el plan elegido,
MembershipSubscribeForm ("use client", mismo patrón handleSubmit+error que
el resto del repo, no bindea la server action directo al action= del form
por el mismo motivo que ManualBookingModal: el tipo de retorno no es
Promise<void>) → createMembershipAction: inserta memberships (activa=false,
RLS nueva "memberships_self_insert") → createMembershipSubscription() (MP
PreApproval) → redirect a initPoint (o a /membresia/estado/[id] si no hay
MP_ACCESS_TOKEN, mismo criterio de degradación que BookingConfirmation)

/servicios/coworking/membresia/estado/[membershipId] — mismo rol que
BookingConfirmation (§45) pero para membresías: Badge Activa/Pendiente,
créditos restantes + vencimiento si está activa, aviso si no hay MP
configurada

MembershipStatus (server component, en /dashboard) — mismo patrón que
PointsHistory: créditos restantes + vencimiento, o link a ver planes si no
hay membresía activa. Gateado por flags.coworking.
```

**Simplificación documentada:** este sprint solo activa la membresía y lleva
el saldo de créditos — el canje de créditos por una reserva (pagar con
créditos en vez de MercadoPago) queda para una pasada siguiente, no se tocó
`bookingActions.ts`.

---

## 52. CheckInScannerModal → extensión: OccupancyDashboard sin cambios; Coordinador — reservas en lote

Nuevo rol con UI propia (`coordinador`, antes sin ninguna ruta/UI — confirmado
por exploración). Sprint 17-18.

```
/coordinador/reservas (dentro de (dashboard), gateado en middleware.ts igual
que /admin y /docente) — lista de espacios activos, botón "Reservar en lote"

/coordinador/reservas/[spaceId] — BatchBookingForm ("use client"): fecha +
hora (hourSlots() de booking.ts) + duración + N semanas (2-12) →
createBatchBookingAction: inserta N bookings (mismo día/hora, +7 días c/u),
tipo_descuento='institucional', estado='confirmada' directo, **sin insertar
en payments** (uso institucional, no es revenue real — decisión documentada,
no aparece en coworking_revenue). Si una semana choca con el constraint
no_overlap, se informa cuál falló y se dejan las demás confirmadas (sin
rollback — mismo tipo de simplificación que otros multi-insert del repo).
```

---

## 53. CancelMyBookingButton / Mis reservas

Cierra un hueco real de Sprint 15-16: ningún usuario podía cancelar su propia
reserva, solo el admin. Sprint 17-18.

```
CancelMyBookingButton ("use client", en BookingConfirmation §45, visible solo
si estado es pendiente/confirmada) → cancelMyBookingAction: mismo patrón que
cancelBookingAction del admin, pero notifica a los admins en vez de al
usuario (RLS de users/notifications no deja leer otros perfiles ni insertar
notificaciones ajenas para un no-admin, así que ese paso puntual usa el
cliente service_role — mismo criterio ya usado en el registro inline de
createBookingAction)

/servicios/coworking/mis-reservas — listado de las reservas propias del
usuario logueado, mismo Table primitive que el resto del repo. Cubre
"Ver historial de reservas" tanto para coordinador como alumno/comunidad.
```

---

## 54. /api/cron/coworking — recordatorios y no-show reales

Sprint 17-18. Disparado por pg_cron + pg_net (migración 016) o a mano con
curl mientras no haya deploy (pg_net no alcanza `localhost`). Lógica en
TypeScript, reusa `notifyUsers`/`sendWhatsapp` tal cual — no se duplica en
SQL. Protegido por `Authorization: Bearer CRON_SECRET`. Sprint 19-20 le suma
`detect_completed_bookings()` a la misma llamada (ver §56).

---

## 55. RedeemPointsCard — canje de puntos por créditos de Coworking

Sprint 19-20. En `/dashboard`, mismo patrón visual que `PointsHistory`
(§ dashboard). Créditos canjeados con puntos son un saldo **separado** de
`memberships.creditos_restantes` (§51) — un usuario puede tener ambos, se
consumen por caminos distintos.

```
RedeemPointsCard ("use client") — recibe puntos/creditosActuales
├── Texto: "{POINTS_PER_COWORKING_CREDIT} puntos = 1 hora", saldo actual,
│   cuánto más alcanza a canjear
└── Botón "Canjear 1 hora de Coworking" → redeemPointsForCreditAction(1)
    (src/app/(dashboard)/actions/coworkingCreditsActions.ts): gasta puntos
    vía awardPoints() con monto negativo (ledger append-only, es un
    movimiento nuevo — nunca se edita uno viejo) y suma
    users.coworking_creditos_canje con el cliente de sesión normal (RLS
    "users_update_own" ya permite id = auth.uid())
```

## 56. Pago con crédito canjeado en BookingForm

Sprint 19-20. **Rama nueva y separada dentro de `createBookingAction`**, no
toca el camino de pago en efectivo (MercadoPago) que ya estaba verificado.

```
BookingForm — si coworkingCreditos (prop nueva) >= duracionHoras, muestra
un checkbox "Pagar con crédito canjeado" en el bloque de Resumen; al
tildarlo cambia el resumen ($0, badge "Pagás con N crédito(s)") y el texto
del botón

createBookingAction — si formData.pagarConCredito === "true": valida
créditos suficientes, inserta la reserva estado='confirmada' directo,
tipo_descuento='canje' (nuevo valor del enum, migración 017),
descuento_pct=100, **sin fila en payments** (no es revenue real, mismo
criterio que las reservas institucionales de coordinador, §52) y descuenta
duracionHoras créditos con el cliente admin ya creado en la función.
Redirige directo a la confirmación, sin pasar por MercadoPago.
```

`detect_completed_bookings()` (migración 017, mismo patrón que
`detect_no_shows()` de la 002) cierra el hueco real de que ninguna reserva
pasaba a `estado='completada'` — la llama tanto `/api/cron/coworking` (§54)
como el botón "Actualizar estados ahora" de `/admin/coworking/ocupacion`
(antes "Detectar no-shows ahora", ahora hace las dos cosas en un click).

## 57. Módulo Tutorías — TutoriaModal / TutoriaList / AsistenciaPanel / TutoriaAlumnoList

Addendum 05. Sesión grupal ligada a un curso (no cita 1:1). La modalidad
presencial reusa la infraestructura de Coworking (§43-49) para bloquear un
aula — misma reserva `institucional` sin fila en `payments` que las de
Coordinador (§52).

```
TutoriaModal ("use client") — src/components/docente/TutoriaModal.tsx
├── Chips de modalidad (virtual/presencial, deshabilitado si no hay
│   FEATURE_COWORKING o no hay aulas activas)
├── Virtual: input de link (Meet/Zoom pegado a mano)
├── Presencial: select de aula + grilla de día/horario (mismos
│   nextBookingDays()/hourSlots()/get_occupied_slots() de BookingForm, §44)
└── Submit → createTutoriaAction (src/app/(dashboard)/docente/actions/
    tutoriaActions.ts): si presencial, inserta primero en bookings
    (tipo_descuento='institucional', sin payments); si el aula ya está
    ocupada (23P01) no llega a crear la tutoría. Notifica a los inscriptos
    (notifyUsers, tipo='tutoria' — ya existía en el enum desde la 003, sin
    productor real hasta ahora)

TutoriaList ("use client") — src/components/docente/TutoriaList.tsx
└── Lista de tutorías del curso con badge de estado, botón "Cancelar"
    (solo programada → cancelTutoriaAction, cancela también la reserva de
    aula asociada) y link a la página de detalle

AsistenciaPanel ("use client") — src/components/docente/AsistenciaPanel.tsx
├── Checklist de alumnos inscriptos → registrarAsistenciaAction (upsert en
│   tutoria_asistencias)
├── Input de link de grabación → cargarGrabacionAction (solo URL, sin
│   upload real de archivo — simplificación documentada en Addendum 05)
└── Solo habilitado cuando la tutoría ya no está "programada"
    (detect_completed_tutorias(), migración 018, la pasa a "realizada")

TutoriaAlumnoList (server component) — src/components/educativa/
TutoriaAlumnoList.tsx — sección "Tutorías" en /cursos/[slug] (mismo lugar
que "Anuncios"), próximas (con link/aula) y pasadas (con grabación si el
docente la cargó)
```

**Simplificación documentada:** recordatorios 24h/1h (`/api/cron/tutorias`,
mismo patrón que `/api/cron/coworking`, §54) van por Email + in-app — sin
WhatsApp por ahora, `users` no tiene ningún campo de teléfono de perfil.

## 58. Módulo Talleres — TallerModal / TallerPublishToggle / TallerCard

Addendum 06. A diferencia de Tutorías, Talleres es 100% autorado por Admin —
sin rol Docente (ADR-18). Sin cron, sin asistencia, sin puntos en esta
pasada (ningún documento original los pide para Talleres).

```
TallerModal ("use client") — src/components/admin/TallerModal.tsx
└── Mismo patrón que CareerModal (§?, admin/CareerModal.tsx): crear/editar,
    createTallerAction/updateTallerAction (src/app/(dashboard)/admin/
    actions/tallerActions.ts) — incluye el campo grabacionUrl editable
    directamente, no hace falta una acción separada tipo la de Tutorías
    (acá no hay "detalle post-evento", el Admin edita el mismo taller)

TallerPublishToggle ("use client") — src/components/admin/
TallerPublishToggle.tsx — 3 estados (borrador/publicado/cancelado, más
simple que course_status: sin revision/archivado, no hay flujo docente→admin)
→ setTallerEstadoAction

TallerCard ("use client") — src/components/educativa/TallerCard.tsx
├── Un solo componente para "Disponibles" y "Mis talleres" (prop
│   `inscripto`), no dos componentes separados
├── Botón Inscribirme/Desinscribirme → inscribirseTallerAction/
│   desinscribirseTallerAction (src/app/(dashboard)/actions/
│   tallerInscripcionActions.ts) — sin restricción de rol, mismo criterio
│   que enrollments de cursos
├── "Cupo lleno" si `capacidad` está seteada y ya se alcanzó — el conteo
│   real usa get_taller_inscripcion_count() (función security definer,
│   migración 019) porque la RLS de taller_inscripciones solo deja ver la
│   fila propia, mismo problema y misma solución que get_occupied_slots()
│   de Coworking (§44)
└── Link "Unirse" (antes del evento) o "Ver grabación" (después, según
    `fecha_inicio + duracion_minutos` comparado con la hora actual — no hay
    un estado "finalizado" guardado en DB, se calcula en el render)
```

Rutas nuevas: `/admin/talleres` (lista + modal + toggle), `/talleres`
(alumno, secciones "Mis talleres"/"Disponibles"). Sidebar:
`(dashboard)/layout.tsx`, mismo bloque `flags.coworking` → ítem "Talleres"
en Plataforma (todo rol) y en Administración (solo admin), gateados por
`flags.talleres`.

---

## 59. CRUD completo de usuarios — EditUserModal / UserActiveToggle

Deuda funcional E1 (`FUNCIONALIDADES.md` §2.1): hasta ahora `/admin/usuarios`
solo tenía alta por CSV y conversión de rol — faltaba editar datos de un
usuario existente y desactivarlo.

```
EditUserModal ("use client") — src/components/admin/EditUserModal.tsx
└── Mismo patrón que CareerModal (§16): Dialog + form controlado,
    updateUserAction (src/app/(dashboard)/admin/actions/userActions.ts).
    Solo edita nombre/apellido/dni/carrera — NO email (identidad ligada a
    auth.users, cambiarlo requeriría reautenticación) ni role/can_teach
    (esos van por convert_user_role()/setCanTeachAction ya existentes,
    ADR-16 — un edit crudo de role rompería la regla de conversión aditiva)

UserActiveToggle ("use client") — src/components/admin/UserActiveToggle.tsx
└── Mismo patrón que LocationActiveToggle (§42)/CanTeachToggle → botón
    Activar/Desactivar, setUserActivoAction. A diferencia de
    locations/spaces (donde `activa=false` solo oculta del catálogo
    público), acá "desactivar" tiene que cortar el acceso real: se agregó
    el chequeo en `middleware.ts` — con `activo=false` cualquier request
    autenticado se desloguea y redirige a `/cuenta-desactivada` (ruta
    pública nueva, mensaje simple + contacto). Antes de este cambio la
    columna `users.activo` no bloqueaba nada, era puramente cosmética.
```

Sin migración nueva — `users.activo`/`users.dni`/`users.carrera_id` ya
existían desde la 001; la policy `users_update_own` (`id = auth.uid() or
is_admin()`) ya permite el UPDATE del admin sobre cualquier fila.

---

## 60. Feature flags editables — FeatureFlagToggle / /admin/configuracion

Deuda funcional E1 (`FUNCIONALIDADES.md` §2.1). CLAUDE.md bumpeado a v3.6
(regla #6): los flags pasan a resolverse desde la tabla `feature_flags`
(migración 020), con fallback a la env var `FEATURE_*` cuando no hay fila —
ver `src/lib/flags.ts` (`getFlags()`, reemplaza al objeto síncrono `flags`
que tenían los 5 Server Components que lo consumían).

```
FeatureFlagToggle ("use client") — src/components/admin/FeatureFlagToggle.tsx
└── Mismo patrón que LocationActiveToggle (§42): botón Activar/Desactivar,
    setFeatureFlagAction (src/app/(dashboard)/admin/actions/
    featureFlagActions.ts, upsert sobre feature_flags)

/admin/configuracion (página nueva, admin) — lista TOGGLEABLE_FLAGS
(src/modules/admin/featureFlags.ts): coworking, tutorías, talleres,
comunidad, catálogo público. `educativa` (E1) NO aparece acá — es el
producto central, sin UI de apagado (CLAUDE.md v3.6).
```

**El toggle no es solo cosmético (nav):** `middleware.ts` gatea de verdad
las rutas del módulo (`moduleRouteFor()`) — `/servicios/coworking*`,
`/admin/coworking*`, `/coordinador*` → `coworking`; `/talleres`,
`/admin/talleres` → `talleres`; `/docente/cursos/*/tutorias` → `tutorias`.
Con el flag apagado, cualquier request a esas rutas redirige (`/dashboard`
si hay sesión, `/` si no) — antes de este cambio los flags solo escondían
ítems del sidebar sin bloquear nada a nivel de ruta. La query a
`feature_flags` en el middleware solo corre cuando la ruta matchea uno de
esos prefijos (evita una consulta extra en cada request, incluidos los
webhooks de `/api/*`).

Sin toggle de ruta para `comunidad`/`publica` en el middleware — son
flags de Etapa 3, todavía no gatean ninguna ruta real en el código (no
existe `/comunidad` ni un catálogo público aparte), el toggle en
`/admin/configuracion` queda listo para cuando se implementen.

---

## 61. Log de auditoría — /admin/auditoria

Deuda funcional E1 (`FUNCIONALIDADES.md` §2.1 "log de auditoría completo").
**Sin migración nueva — la tabla `audit_log` ya existía desde la 001**
(columnas `user_id`, `accion`, `entidad`, `entidad_id`, `detalle` jsonb,
`created_at`), con RLS `audit_admin` (`for all using (is_admin())`) y su
índice `idx_audit_user`, pero nunca se había conectado a ningún código —
0 lecturas/escrituras reales en todo el proyecto hasta esta pasada. **Bug
real encontrado y corregido en esta misma sesión** (no en producción,
antes de commitear): la primera versión de `src/lib/audit.ts` asumía una
tabla nueva con columna `actor_id` e insertaba con el cliente de sesión
normal — habría fallado dos veces: `create table` sobre una tabla ya
existente, e insert rechazado por RLS para cualquier no-admin (ej. un
docente creando una tutoría). Corregido antes de que el usuario llegara a
correr nada.

```
src/lib/audit.ts — logAudit({ actorId, accion, entidad, entidadId?,
detalle? }). Usa createAdminClient() (service_role) para el insert, mismo
patrón que awardPoints() (src/lib/points.ts) y checkAndIssueCertificate()
(src/lib/certificates.ts) — la policy audit_admin solo permite escribir a
is_admin(), pero varias acciones auditadas las dispara un docente sin ese
rol. Best-effort, nunca tira la acción del llamador si el insert falla
(mismo criterio que notifyUsers()).

/admin/auditoria (página, admin) — tabla de las últimas 200 acciones +
filtro por entidad (form GET, sin JS). Resuelve nombre del actor con una
query aparte a `users` (mismo patrón que RoleHistoryTimeline, §?)
```

**Acciones instrumentadas en esta pasada** (server actions existentes, un
`logAudit()` agregado después de cada mutación exitosa — no se tocó la
lógica de negocio): conversión de rol y `can_teach` (`convertRoleActions.ts`),
edición/activación de usuario (`userActions.ts`), importación CSV
(`importUsersActions.ts`, una fila por lote, no por usuario), CRUD +
publicar de carreras y cursos (`careerActions.ts`, `courseActions.ts`),
aprobar/rechazar curso (`reviewActions.ts`), CRUD + activar de sedes y
espacios de Coworking (`coworkingActions.ts`), reserva manual/cancelación/
check-in (`bookingAdminActions.ts`), CRUD de planes de membresía
(`membershipPlanActions.ts`), CRUD + publicar de talleres (`tallerActions.ts`),
toggle de feature flags (`featureFlagActions.ts`), crear/cancelar tutoría
(docente, `tutoriaActions.ts`).

**Deliberadamente fuera de esta pasada** (mismo criterio que otras
"simplificaciones documentadas" del proyecto — no hay pedido explícito de
ningún documento para este nivel de detalle): ediciones de estructura de
curso (módulos/clases/evaluaciones — son de alta frecuencia y ya tienen su
propio historial de revisión vía `courses.revision_comentario`), acciones
de autoservicio del alumno/comunidad (cancelar la propia reserva, canjear
puntos — no son acciones *administrativas*), y el re-disparo manual de
`runNoShowDetectionAction` (una utilidad de debug, no una mutación de
negocio).

---

## 62. Bloque B deuda funcional E1/E2 — reportes, métricas y exportación

Deuda funcional (`FUNCIONALIDADES.md` §2.2/§2.3/§4.2/§4.3): progreso/engagement
de alumnos (admin + docente), gráficos de ocupación de Coworking, export CSV
de evaluaciones, export PDF de reportes de Coworking.

```
Migración 021_course_students_progress.sql — extiende la vista
`course_students` (005) con progreso_pct/estado/fechas de `enrollments`.
Antes de esto la RLS `enrollments_own` (001) solo dejaba ver la fila propia
o a admin — un docente no podía leer el progreso de sus propios alumnos.
Mismo criterio que get_occupied_slots()/get_taller_inscripcion_count(): se
extiende una vista ya restringida por can_teach_course()/is_admin() en vez
de abrir la RLS de la tabla base.

/docente/cursos/[id]/alumnos (página nueva, docente) — roster con barra de
progreso + 3 KPI (inscriptos/progreso promedio/completados), export CSV.
Link "Alumnos" agregado al header de CourseEditor (§27), mismo lugar que
"Anuncios"/"Tutorías".

/admin/metricas (página nueva, admin) — mismo patrón cross-curso: KPIs
globales (alumnos activos, progreso promedio, certificados emitidos) + tabla
por curso, export CSV. Ítem nuevo "Métricas" en el sidebar de Administración.

CsvExportButton ("use client") — src/components/admin/CsvExportButton.tsx
└── Renombre de RevenueExportButton (§49) a un nombre genérico — la lógica
    ya era genérica (headers/rows/filename), solo la usaba Ingresos.
    Reutilizado ahora en Reservas, Ocupación, roster de alumnos, métricas y
    resultados de evaluaciones (docente).

PdfReportExportButton ("use client") — src/components/admin/
PdfReportExportButton.tsx — mismo patrón que certificatePdf.tsx (fondo
claro, excepción documentada al dark mode exclusivo — es un documento
imprimible), pero renderizado 100% client-side con `pdf(...).toBlob()` de
@react-pdf/renderer (ya era dependencia del proyecto) en vez de subir a
Storage — no hace falta persistir un reporte de export. Reusable con
headers/rows genéricos, igual que CsvExportButton. Wireado en Ingresos,
Reservas y Ocupación de Coworking.

OccupancyBarChart (server component, sin "use client") —
src/components/admin/OccupancyBarChart.tsx — barra horizontal de una sola
serie (gradiente --inc-violet→--inc-magenta, mismo que Progress), sin
librería de gráficos. Usado en /admin/coworking/ocupacion para "Espacios
más usados" y "Horarios pico" (agregado de `bookings` de los últimos ~30
días, ya fetcheados en la página — sin query nueva). Simplificación
documentada frente a la skill de dataviz: al ser una sola serie con label +
valor siempre visible en texto, no hace falta legend ni tooltip custom con
crosshair (el `title` nativo alcanza) ni paleta categórica a validar.
```

**Decisión de alcance — Excel descartado, PDF sí:** el checklist pedía
"exportar en PDF y Excel". Se evaluó agregar el paquete `xlsx` (SheetJS) de
npm para generar `.xlsx` real — `npm audit` marcó 2 CVEs de severidad alta
sin fix disponible (`GHSA-4r6h-8v6p-xvw6` prototype pollution,
`GHSA-5pgg-2g8v-p4x9` ReDoS; SheetJS dejó de publicar parches al paquete de
npm, solo a su propio CDN). Se descartó la dependencia — el CSV ya
existente lo abre Excel nativo sin problema, así que agregar `xlsx` no
sumaba nada real más que el riesgo de la CVE. Se implementó PDF en su
lugar (formato genuinamente distinto del CSV: reporte imprimible, no
editable) con `@react-pdf/renderer`, ya instalado.

---

## 63. Bloque C deuda funcional E1 — certificado de especialización + prerequisitos de carrera

Deuda funcional (`FUNCIONALIDADES.md` §2.3/§8.2/§8.4). Auditoría previa
encontró que 3 de los 4 ítems de §8.4 ya estaban resueltos (`CareerMap` en
`/carreras/[slug]` ya leía `enrollments.progreso_pct` real, no era mock) —
checkboxes corregidos sin código nuevo. Lo que sí faltaba de verdad:

```
Migración 021_course_students_progress.sql — ver §62 (ya documentada,
sin cambios).

Migración 022_career_certificates.sql — tabla nueva career_certificates
(distinta granularidad de certificates: por carrera, no por curso), mismo
patrón de RLS (own + is_admin()) y verificación pública
(verify_career_certificate, security definer) que certificates/
verify_certificate (001).

Migración 023_certificate_name_override.sql — columna nombre_override en
certificates + verify_certificate() actualizada para reflejarla en la
verificación pública, no solo en el PDF.

enrollUserAction (src/app/(dashboard)/cursos/actions/enrollActions.ts) —
BUG REAL encontrado y corregido: CareerMap ya mostraba el candado de
"bloqueado" en cursos fuera de secuencia, pero la acción de inscripción
nunca lo exigía — un alumno podía entrar directo a /cursos/[slug] de un
curso posterior e inscribirse igual, sin haber completado el anterior.
Ahora valida contra el curso previo de la misma carrera (mismo orden por
created_at que ya usaba CareerMap) — cursos sin carrera_id ("curso
adicional", CU-T01) siguen libres, es a propósito.

checkAndIssueCareerCertificate() (src/lib/certificates.ts) — se dispara
automático al final de checkAndIssueCertificate() cuando el curso recién
certificado tenía carrera_id. "Completó la carrera" = tiene un
certificate (de curso) por cada curso publicado de esa carrera — reusa la
validación de evaluaciones ya hecha a nivel de curso en vez de
reimplementarla. +300 puntos (vs +100 de un certificado de curso).

generateCareerCertificatePdf() (src/lib/certificatePdf.tsx) — mismo
CertificateDocument que el certificado de curso, generalizado con
título/logroLabel/logroTitulo en vez de hardcodear "curso".

/certificados (alumno) — ahora lista certificados de carrera primero
(más "grandes"), reusa CertificateCard tal cual sin cambios (label
"Especialización — {carrera}").

/verificar/[uuid] — intenta verify_certificate() y, si no hay resultado,
verify_career_certificate().

/admin/certificados (página nueva, admin) — EditCertificateNameModal
(edita nombre_override, regenera el PDF automático al guardar) +
RegenerateCertificateButton (re-renderiza sin cambiar el nombre — para
cuando se corrige algo del lado del template/QR). Certificados de carrera
NO tienen esta UI en esta pasada — el checklist solo pedía "certificado
emitido" en general y course-level es el caso de uso real (correcciones
de nombre por typo en DNI/importación CSV).
```

**Bug real encontrado durante esta pasada, corregido antes de que llegara
a producción:** la primera versión de `src/lib/audit.ts` (§61) asumía una
tabla `audit_log` nueva con columna `actor_id` — la tabla ya existía desde
la 001 con columna `user_id` y RLS admin-only. Ver §61, corregido.

---

## 64. Materiales adjuntos por clase — LessonAttachmentsManager / LessonAttachments

Deuda funcional E1 (§3.4/§8.1): adjuntos *extra* por clase (ej. una guía de
ejercicios sobre una clase de video), separados del contenido principal
(`lessons.contenido_url`). Tabla propia `lesson_attachments` (migración 027)
— reusa el bucket `contenido-cursos` existente, ruta
`{course_id}/adjuntos/{lesson_id}/{archivo}`. RLS con `can_teach_course()`
(004) para cubrir también el rol dual, mismo patrón que `lessons_write`.

```
LessonAttachmentsManager ("use client", src/components/docente/)
├── Dentro de LessonModal (§?), solo visible al editar una clase existente
│   (necesita lesson.id — en "Nueva clase" hay que guardar primero)
├── Mismo patrón de subida que LessonUploader (§28): cliente de browser,
│   sin progress bar (archivos de adjunto suelen ser chicos)
└── Lista con borrar (Trash2) — addLessonAttachmentAction /
    deleteLessonAttachmentAction (docente/actions/lessonAttachmentActions.ts)

LessonAttachments (server, src/components/educativa/)
├── En la página de clase del alumno, debajo de LessonPlayer/ContentViewer,
│   sin importar el tipo de la clase
└── Lista de links de descarga con URL firmada (getSignedLessonContentUrl,
    mismo helper que el contenido principal) — no se renderiza si no hay
    adjuntos
```

---

## 65. Nurturing de leads días 1/3/7 (T12) — copy pendiente de aprobación

**⚠️ Este copy es un borrador — no está aprobado tácitamente. Revisar y
ajustar antes de un envío real contra leads reales.**

Secuencia de 3 emails cortos, tono institucional INCADE ES/AR, disparados
por `/api/cron/nurturing` (migración 037) según días desde el alta como
`role='lead'` (post-registro a un taller gratuito, ver §5.5 de
`FUNCIONALIDADES.md`). Lógica de elegibilidad en
`src/modules/comunicacion/nurturing.ts` (`isNurturingDue`, cubierta por
`tests/unit/nurturing.test.ts`); copy en `nurturingEmailContent()` del
mismo archivo.

**Día 1 — bienvenida al taller**
> Asunto: *Gracias por sumarte al taller — INCADE*
> Gracias por registrarte en nuestro taller gratuito. Esperamos que te
> haya sido útil. Si te interesó, en INCADE tenés cursos y carreras
> completas para seguir formándote. Cuando quieras, date una vuelta por
> nuestro catálogo.

**Día 3 — vitrina de cursos**
> Asunto: *Cursos que te pueden interesar — INCADE*
> Te dejamos algunos de los cursos más elegidos de nuestro catálogo
> educativo, por si querés seguir aprendiendo con nosotros. Podés verlos
> completos en incadeducativa.com/cursos.

**Día 7 — CTA comunidad**
> Asunto: *¿Seguimos en contacto? — INCADE*
> Esperamos que el taller te haya servido. Si querés seguir cerca de
> INCADE, sumate a nuestra comunidad: te avisamos de nuevos talleres,
> cursos y contenido. Nos encontrás en incadeducativa.com cuando quieras.

**Decisiones de esta pasada:**
- Sin herramientas nuevas (Resend, ya en uso — nada de Twilio/Mailchimp/
  Brevo).
- Envío in-app (bandeja de notificaciones) + email, mismo `notifyUsers()`
  que el resto del sistema, `tipo='sistema'` (no hay un tipo dedicado de
  "nurturing" en el enum — no se justificaba agregar uno para 3 mails).
- **No se corrió un envío real contra Resend en esta sesión** —
  `RESEND_API_KEY` ya tiene valor cargado localmente, así que una prueba
  mal acotada mandaría mail de verdad a una dirección real (regla
  explícita de `resolver_loop1.md` T12). La lógica de elegibilidad
  (quién está due, qué día, deduplicación) está cubierta por unit tests
  puros, sin red. Un test contra Resend real queda para cuando el
  usuario lo confirme explícitamente, con un destinatario de prueba
  propio.
- Migración 037 (columnas de flag + `pg_cron`) sin aplicar contra
  ninguna DB — mismo criterio que toda migración nueva.

---

*INCADEducativa · Design System v2.1 — COMPONENTS v1.10 · Septiembre 2026*
