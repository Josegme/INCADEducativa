# Design System — INCADEducativa
**Versión 2.1 · Julio 2026**
Preparado por: JosegmeDev + Alan Schwegler
Ecosistema Digital INCADE — Posadas, Misiones

---

## 0. Posición en el ecosistema

INCADEducativa es el **hub central** del ecosistema digital INCADE. Los demás sistemas (INCAJOB, Coworking, A-English) son módulos o servicios que orbitan alrededor de la plataforma educativa.

```
              ┌─────────────────────┐
              │   INCADEducativa    │  ← HUB CENTRAL
              │   (este sistema)    │
              └──────────┬──────────┘
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      INCAJOB        Coworking      A-English
   (inserción      (espacio de     (idiomas)
    laboral)        trabajo)
```

**Fuente de verdad visual del ecosistema:** el sitio institucional `incade.edu.ar` — dark mode espacial, violeta/magenta brillante, tipografía bold de impacto. INCADEducativa hereda directamente de esta identidad.

**Relación con INCAJOB:** INCAJOB tiene su propio manual de identidad (modo claro, violeta institucional oscuro `#5B2A86`). INCADEducativa **no hereda de INCAJOB** — ambos comparten solo los puntos de contacto mínimos definidos en la Sección 6 de este documento.

---

## 1. ADN Visual — de dónde viene

El sitio institucional de INCADE define la identidad real del ecosistema:

- **Modo:** dark mode con fondo espacial profundo (negro azulado con textura)
- **Violeta:** brillante, saturado, más cercano a magenta-violeta que al institucional corporativo
- **Botón primario:** violeta/magenta sólido, pill o border-radius generoso
- **Botón secundario:** outline blanco, texto oscuro o blanco
- **Tipografía:** bold, display, alto impacto en heroes y títulos
- **Tono general:** profesional con energía — no universitario rígido, no startup neón puro

INCADEducativa traduce esta identidad a una interfaz de uso sostenido (el alumno pasa horas aquí), ajustando contrastes y densidad de información sin perder el carácter visual.

---

## 2. Paleta de colores

### 2.1 Violeta institucional INCADE

Extraído directamente del sitio incade.edu.ar. Este es el violeta real de la marca, no el del manual de INCAJOB.

| Token | Valor | Uso |
|---|---|---|
| `--inc-violet` | `#9B30FF` | Color primario de marca — botones principales, links activos, elementos de énfasis |
| `--inc-violet-hover` | `#8520EE` | Estado hover de elementos primarios |
| `--inc-violet-subtle` | `rgba(155, 48, 255, 0.15)` | Fondos de íconos, backgrounds sutiles, hover de nav |
| `--inc-violet-border` | `rgba(155, 48, 255, 0.25)` | Bordes de cards, separadores |
| `--inc-violet-border-strong` | `rgba(155, 48, 255, 0.50)` | Bordes de focus, cards en hover |
| `--inc-violet-text` | `#A855F7` | Texto de acento sobre fondos `-subtle` violeta — badge "activo", ítem de nav activo, role badge admin |

### 2.2 Magenta — acento secundario institucional

Presente en el sitio institucional como gradiente y acento. En INCADEducativa se usa para badges especiales, gradientes de hero y elementos de mayor energía visual.

| Token | Valor | Uso |
|---|---|---|
| `--inc-magenta` | `#C026D3` | Acento secundario — gradientes, badges destacados, elementos de llamada a la acción secundaria |
| `--inc-magenta-subtle` | `rgba(192, 38, 211, 0.12)` | Fondos muy sutiles de acento |
| `--inc-magenta-text` | `#e879f9` | Texto de acento sobre fondo magenta subtle — role badge docente |

### 2.3 Gradiente de marca INCADE

El gradiente violeta→magenta es la firma visual del ecosistema. Aparece en heroes, barras de progreso destacadas, elementos de onboarding.

```css
--inc-gradient: linear-gradient(135deg, #9B30FF 0%, #C026D3 100%);
--inc-gradient-subtle: linear-gradient(135deg, rgba(155,48,255,0.2) 0%, rgba(192,38,211,0.1) 100%);
```

### 2.4 Superficies — dark mode educativo

Fondos con matiz azul-violeta profundo, no negro puro. El sitio institucional usa una textura espacial — INCADEducativa usa la misma profundidad de color sin la textura fotográfica.

| Token | Valor | Uso |
|---|---|---|
| `--edu-bg` | `#08080F` | Fondo base de la aplicación |
| `--edu-surface` | `#100F1E` | Cards, paneles, sidebar |
| `--edu-surface-alt` | `#151428` | Superficies elevadas, hero sections |
| `--edu-surface-raised` | `#1C1A35` | Modales, dropdowns, tooltips |

### 2.5 Texto

| Token | Valor | Uso |
|---|---|---|
| `--edu-text` | `#FFFFFF` | Texto principal |
| `--edu-text-muted` | `rgba(255, 255, 255, 0.55)` | Labels, descripciones, subtítulos |
| `--edu-text-faint` | `rgba(255, 255, 255, 0.30)` | Placeholders, texto deshabilitado, ícono inactivo |

### 2.6 Bordes

| Token | Valor | Uso |
|---|---|---|
| `--edu-border` | `rgba(155, 48, 255, 0.20)` | Borde estándar de cards e inputs |
| `--edu-border-strong` | `rgba(155, 48, 255, 0.45)` | Borde de focus, hover |
| `--edu-border-neutral` | `rgba(255, 255, 255, 0.07)` | Separadores, divisores sutiles |

### 2.7 Estados semánticos educativos

Semántica específica del LMS — progreso, logro, advertencia, error.

| Token | Valor | Uso |
|---|---|---|
| `--edu-success` | `#10B981` | Módulo completado, clase aprobada, checkmark |
| `--edu-success-subtle` | `rgba(16, 185, 129, 0.15)` | Fondo de badge "Completado" / "Aprobado" |
| `--edu-success-border` | `rgba(16, 185, 129, 0.30)` | Borde de elementos en estado completado |
| `--edu-success-text` | `#34d399` | Texto de acento sobre `--edu-success-subtle` — badge "completado", role badge alumno |
| `--edu-warning` | `#F59E0B` | Timer de quiz, clase pendiente, alerta |
| `--edu-warning-subtle` | `rgba(245, 158, 11, 0.12)` | Fondo de badge "Pendiente" |
| `--edu-warning-border` | `rgba(245, 158, 11, 0.30)` | Borde de elementos en estado pendiente |
| `--edu-warning-text` | `#FBBF24` | Texto de acento sobre `--edu-warning-subtle` — badge "pendiente" |
| `--edu-danger` | `#EF4444` | Error de formulario, quiz reprobado |
| `--edu-danger-subtle` | `rgba(239, 68, 68, 0.10)` | Fondo de mensaje de error |
| `--edu-danger-border` | `rgba(239, 68, 68, 0.25)` | Borde de elementos en error |
| `--edu-danger-text` | `#F87171` | Texto de acento sobre `--edu-danger-subtle` — badge "error" |

### 2.8 Dorado — certificados y logros máximos

Exclusivo para el sistema de certificación. No se usa en navegación ni estados comunes.

| Token | Valor | Uso |
|---|---|---|
| `--edu-gold` | `#E8C97A` | Ícono de certificado, nodo final del mapa de carrera |
| `--edu-gold-subtle` | `rgba(232, 201, 122, 0.12)` | Fondo de card de certificado |
| `--edu-gold-border` | `rgba(232, 201, 122, 0.30)` | Borde de card de certificado |

---

## 3. Tipografía

### Familia principal

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

Inter es la fuente del ecosistema INCADE digital. Se carga siempre desde Google Fonts como fuente primaria — nunca confiar solo en las fuentes del sistema operativo.

Pesos en uso: Regular 400 · Medium 500 · SemiBold 600 · Bold 700.

### Escala tipográfica

INCADEducativa define su propia escala, optimizada para consumo de contenido educativo y sesiones largas.

| Token | Tamaño | Peso | Line-height | Uso |
|---|---|---|---|---|
| `--type-hero` | 28–32px | Bold 700 | 1.2 | Títulos de hero, saludo principal del dashboard |
| `--type-title` | 20px | SemiBold 600 | 1.3 | Título de sección, encabezado de pantalla |
| `--type-subtitle` | 16px | SemiBold 600 | 1.4 | Título de card, nombre de curso |
| `--type-body` | 14px | Regular 400 | 1.65 | Texto de contenido, descripciones — line-height alto para lectura extendida |
| `--type-ui` | 13px | Medium 500 | 1.4 | Ítems de navegación, labels de UI |
| `--type-label` | 12px | SemiBold 600 | 1.3 | Badges, chips, etiquetas de categoría |
| `--type-micro` | 11px | Medium 500 | 1.3 | Metadata, timestamps, texto de segunda línea |

### Reglas tipográficas

- **Botones:** SemiBold 600, 14px, Sentence case. Nunca ALL CAPS.
- **Etiquetas de categoría de curso:** SemiBold 600, 12px, UPPERCASE, `letter-spacing: 0.7px`.
- **Ítems de nav inactivos:** Medium 500. Activo: SemiBold 600.
- **Párrafos de contenido educativo:** Regular 400, 14px, `line-height: 1.65` — el line-height alto es crítico para lecturas de 30+ minutos.
- **Números de métricas / KPI:** Bold 700, 24–32px.

---

## 4. Geometría

### Radios de esquina

INCADEducativa define su propia geometría, coherente con el sitio institucional (border-radius generoso, no excesivamente cuadrado).

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | `6px` | Badges pequeños, chips inline |
| `--radius-md` | `10px` | Botones, inputs |
| `--radius-lg` | `14px` | Cards, paneles, sidebar de lección |
| `--radius-xl` | `20px` | Modales, hero cards |
| `--radius-pill` | `999px` | Badges de estado pill, avatares, barras de progreso |

### Sombras

| Token | Valor | Uso |
|---|---|---|
| `--shadow-card` | `0px 2px 8px rgba(0, 0, 0, 0.40)` | Cards estándar en dark mode |
| `--shadow-card-violet` | `0px 4px 20px rgba(155, 48, 255, 0.15)` | Cards de curso destacadas, elementos con hover activo |
| `--shadow-modal` | `0px 8px 40px rgba(0, 0, 0, 0.70)` | Modales y overlays |

---

## 5. Implementación — `globals.css` y `tailwind.config.ts`

### globals.css

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  /* Violeta institucional INCADE */
  --inc-violet:              #9B30FF;
  --inc-violet-hover:        #8520EE;
  --inc-violet-subtle:       rgba(155, 48, 255, 0.15);
  --inc-violet-border:       rgba(155, 48, 255, 0.25);
  --inc-violet-border-strong:rgba(155, 48, 255, 0.50);
  --inc-violet-text:         #A855F7;
  --inc-magenta:             #C026D3;
  --inc-magenta-subtle:      rgba(192, 38, 211, 0.12);
  --inc-magenta-text:        #e879f9;
  --inc-gradient:            linear-gradient(135deg, #9B30FF 0%, #C026D3 100%);
  --inc-gradient-subtle:     linear-gradient(135deg, rgba(155,48,255,0.2) 0%, rgba(192,38,211,0.1) 100%);

  /* Superficies */
  --edu-bg:                  #08080F;
  --edu-surface:             #100F1E;
  --edu-surface-alt:         #151428;
  --edu-surface-raised:      #1C1A35;

  /* Texto */
  --edu-text:                #FFFFFF;
  --edu-text-muted:          rgba(255, 255, 255, 0.55);
  --edu-text-faint:          rgba(255, 255, 255, 0.30);

  /* Bordes */
  --edu-border:              rgba(155, 48, 255, 0.20);
  --edu-border-strong:       rgba(155, 48, 255, 0.45);
  --edu-border-neutral:      rgba(255, 255, 255, 0.07);

  /* Estados educativos */
  --edu-success:             #10B981;
  --edu-success-subtle:      rgba(16, 185, 129, 0.15);
  --edu-success-border:      rgba(16, 185, 129, 0.30);
  --edu-success-text:        #34d399;
  --edu-warning:             #F59E0B;
  --edu-warning-subtle:      rgba(245, 158, 11, 0.12);
  --edu-warning-border:      rgba(245, 158, 11, 0.30);
  --edu-warning-text:        #FBBF24;
  --edu-danger:              #EF4444;
  --edu-danger-subtle:       rgba(239, 68, 68, 0.10);
  --edu-danger-border:       rgba(239, 68, 68, 0.25);
  --edu-danger-text:         #F87171;

  /* Certificados */
  --edu-gold:                #E8C97A;
  --edu-gold-subtle:         rgba(232, 201, 122, 0.12);
  --edu-gold-border:         rgba(232, 201, 122, 0.30);

  /* Geometría */
  --radius-sm:               6px;
  --radius-md:               10px;
  --radius-lg:               14px;
  --radius-xl:               20px;
  --radius-pill:             999px;

  /* Sombras */
  --shadow-card:             0px 2px 8px rgba(0, 0, 0, 0.40);
  --shadow-card-violet:      0px 4px 20px rgba(155, 48, 255, 0.15);
  --shadow-modal:            0px 8px 40px rgba(0, 0, 0, 0.70);
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--edu-bg);
  color: var(--edu-text);
  font-size: 14px;
  line-height: 1.65;
}
```

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        inc: {
          violet:  '#9B30FF',
          magenta: '#C026D3',
        },
        edu: {
          bg:             '#08080F',
          surface:        '#100F1E',
          'surface-alt':  '#151428',
          'surface-raised':'#1C1A35',
          success:        '#10B981',
          warning:        '#F59E0B',
          danger:         '#EF4444',
          gold:           '#E8C97A',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        sm:   '6px',
        md:   '10px',
        lg:   '14px',
        xl:   '20px',
        pill: '9999px',
      },
      boxShadow: {
        card:        '0px 2px 8px rgba(0, 0, 0, 0.40)',
        'card-violet':'0px 4px 20px rgba(155, 48, 255, 0.15)',
        modal:       '0px 8px 40px rgba(0, 0, 0, 0.70)',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 6. Puntos de contacto mínimos con el ecosistema

Estos son los únicos elementos que INCADEducativa comparte con los demás sistemas del ecosistema para que un usuario perciba coherencia institucional. Nada más se fuerza.

| Elemento | Valor compartido | Por qué |
|---|---|---|
| Violeta de marca | `#9B30FF` (o derivado de `--inc-violet`) | Es el color que el usuario asocia con INCADE en todos los puntos de contacto |
| Familia tipográfica | Inter | Coherencia de lectura y personalidad de marca |
| Logo mark "IN" | Recuadro con `--inc-violet`, mismo estilo en todos los sistemas | Reconocimiento inmediato de ecosistema |
| Modo de color | Dark mode en INCADEducativa / Light mode en INCAJOB | Diferenciación funcional deliberada — el usuario lo entiende como contextos distintos |

Todo lo demás — layout, tamaños, componentes, estructura de navegación — es propio de cada sistema y respeta su función específica.

---

## 7. Uso con agentes de Claude Code

Fragmento de contexto para incluir en prompts al agente `@designer` o cualquier agente de frontend:

```
Design System INCADEducativa v2.0.
Modo: dark mode exclusivo.
Fondo base: #08080F. Superficies: #100F1E / #151428 / #1C1A35.
Color primario: --inc-violet #9B30FF. Acento: --inc-magenta #C026D3.
Gradiente de marca: linear-gradient(135deg, #9B30FF 0%, #C026D3 100%).
Tipografía: Inter (Google Fonts). Pesos: 400/500/600/700.
Body: 14px / line-height 1.65.
Radios: 6px (sm) · 10px (md/btn) · 14px (cards) · 20px (modales) · 999px (pills).
Estados: success #10B981 · warning #F59E0B · danger #EF4444 · gold #E8C97A.
Íconos: Lucide (primario). Sin ALL CAPS en botones. Sin fuentes del sistema como primaria.
INCADEducativa es el hub central del ecosistema — no hereda layout ni componentes de INCAJOB.
```

---

*INCADEducativa · incadeducativa.com*
*INCADE Escuela de Negocios — Posadas, Misiones*
*Design System v2.1 — Julio 2026*
