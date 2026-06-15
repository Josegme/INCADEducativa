# ADDENDUM 01 — Motor de Evaluaciones y Entregas
**INCADEducativa · Spec v3 — Addendum**
**Fecha:** Junio 2026
**Autores:** JosegmeDev + Alan Schwegler

> ⚠️ **DOCUMENTO ARCHIVADO — referencia histórica, no editar.**
> Su contenido fue integrado por completo en `docs/INCADEducativa_Spec_v3.md` v3.4
> (§2, §5 CU-04, §10, ADR-12), `docs/FUNCIONALIDADES.md` (§4.3, §5.6),
> `docs/LIFECYCLE_PLAN.md` (Sprints 7-10) y `supabase/migrations/003_motor_evaluaciones_comunicacion.sql`.
> La fuente de verdad vigente es el Spec v3.4.

---

## Contexto

La Spec v3 menciona "cuestionario por módulo" y "examen final con tiempo límite" de forma genérica, sin detallar tipos de pregunta, flujo de corrección ni entregas de trabajos prácticos. Este addendum define el **Motor de Evaluaciones** como un módulo propio con editor visual, tipos de pregunta configurables y flujo de corrección diferenciado por tipo.

**Principio de diseño:** el editor de evaluaciones debe ser el módulo más simple de usar para el docente. La dificultad de armado de evaluaciones en otras plataformas es el principal cuello de botella para la carga de contenido. Este módulo prioriza la usabilidad por encima de todo.

---

## 1. Tipos de evaluación soportados

El sistema contempla dos contextos de evaluación:

| Tipo | Dónde aparece | Quién la configura | Corrección |
|---|---|---|---|
| Cuestionario de módulo | Al finalizar cada módulo | Docente o Admin | Automática |
| Examen final del curso | Al completar todas las clases | Docente o Admin | Automática + manual según tipo |
| Entrega de TP | En cualquier clase o módulo | Docente o Admin | Manual (docente) |

---

## 2. Tipos de pregunta

### 2.1 Verdadero / Falso con fundamentación

- El alumno selecciona Verdadero o Falso.
- Campo de texto obligatorio para fundamentar la respuesta (mínimo de caracteres configurable).
- La opción V/F se autocorrige. La fundamentación es revisada manualmente por el docente.
- Peso configurable: parte por V/F automático + parte por fundamentación manual.

### 2.2 Opción múltiple — respuesta única

- El docente escribe la pregunta y entre 2 y 6 opciones de respuesta.
- Marca cuál es la correcta.
- Corrección automática.
- Retroalimentación configurable: el docente puede escribir una explicación que el alumno ve al corregirse.

### 2.3 Opción múltiple — respuestas múltiples

- El alumno puede marcar más de una opción correcta.
- El docente define cuáles son correctas y si la puntuación es proporcional (por opción correcta marcada) o todo-o-nada.
- Corrección automática.

### 2.4 Pregunta abierta

- Campo de texto libre para el alumno.
- No tiene corrección automática.
- El docente accede a las respuestas desde el panel de correcciones y carga la nota manualmente.
- El docente puede dejar un comentario de devolución por alumno.
- Estado de la entrega: `PENDIENTE_CORRECCIÓN` → `CORREGIDA`.

### 2.5 Entrega de trabajo práctico (TP)

- El alumno puede entregar mediante una o más de las siguientes opciones (configurable por el docente):
  - **Upload de archivo:** PDF, DOCX, imágenes, ZIP (tamaño máximo configurable).
  - **Link de Google Drive:** el alumno pega la URL del documento compartido.
  - **Link de GitHub:** URL de repositorio o pull request.
  - **URL externa:** cualquier otro enlace (Notion, Figma, Canva, etc.).
  - **Texto en plataforma:** respuesta larga directamente en la plataforma.
- El docente configura qué tipo(s) de entrega acepta para ese TP.
- El docente accede a todas las entregas del grupo desde el panel de correcciones, ordenadas por alumno.
- Carga nota y comentario de devolución por alumno.
- El alumno recibe notificación cuando su TP fue corregido.
- Estado: `PENDIENTE_ENTREGA` → `ENTREGADO` → `CORREGIDO`.

---

## 3. Editor de evaluaciones — experiencia del docente

El docente arma la evaluación desde un editor visual por bloques, sin código ni formularios complejos.

**Flujo de creación:**

1. Docente entra al curso → sección "Evaluaciones".
2. Selecciona si es un cuestionario de módulo, examen final o entrega de TP.
3. Hace clic en "+ Agregar pregunta" y elige el tipo desde un menú visual con iconos.
4. Completa la pregunta en el campo de texto enriquecido (soporta negrita, listas, imágenes).
5. Configura las opciones, la respuesta correcta y el peso sobre la nota total.
6. Reordena las preguntas con drag & drop.
7. Configura parámetros globales de la evaluación:
   - Tiempo límite (opcional, en minutos).
   - Nota mínima de aprobación (porcentaje, default: 60%).
   - Cantidad de intentos permitidos.
   - Tiempo de espera entre intentos fallidos (default: 24hs).
   - Mostrar resultado al alumno inmediatamente o diferido (cuando el docente corrija).
8. Guarda como BORRADOR o envía junto con el contenido del curso a revisión.

**El Admin tiene acceso al mismo editor** y puede crear o editar evaluaciones directamente sin pasar por el flujo de revisión.

---

## 4. Flujo de corrección manual

Para preguntas abiertas, V/F con fundamentación y TPs:

1. El docente ve en su panel un badge con el número de correcciones pendientes.
2. Entra a "Correcciones pendientes" → lista de alumnos con entrega pendiente de revisión.
3. Para cada alumno: ve la respuesta o entrega, carga la nota parcial y escribe una devolución.
4. Al guardar, el sistema actualiza la nota total del alumno integrando la parte automática + la parte manual.
5. El alumno recibe notificación in-app + email con su nota y la devolución del docente.

---

## 5. Panel de resultados del docente

El docente tiene una vista de resultados por evaluación:

- Tabla con todos los alumnos, nota obtenida y estado (aprobado / desaprobado / pendiente de corrección).
- Promedio del grupo y distribución de notas.
- Exportación a CSV.
- Filtro por estado.

---

## 6. Impacto en la jerarquía de contenido existente

La jerarquía `Carrera → Curso → Módulo → Clase` se mantiene. Las evaluaciones se agregan como elementos de primer nivel dentro de Módulo y Curso:

```
Curso
├── Módulo 1
│   ├── Clase 1.1
│   ├── Clase 1.2
│   └── Cuestionario de módulo  ← nuevo elemento tipado
├── Módulo 2
│   ├── Clase 2.1
│   └── Entrega TP 1            ← nuevo elemento tipado
└── Examen final                ← al nivel del curso
```

---

## 7. Estados de evaluación del alumno

| Estado | Descripción |
|---|---|
| `BLOQUEADA` | El alumno no completó el contenido previo requerido |
| `DISPONIBLE` | El alumno puede rendir |
| `EN_CURSO` | El alumno inició la evaluación (timer activo si hay límite) |
| `PENDIENTE_CORRECCIÓN` | Entregada, aguardando revisión manual del docente |
| `APROBADA` | Nota ≥ mínimo configurado |
| `DESAPROBADA` | Nota < mínimo. Puede reintentar según configuración |
| `CORREGIDA` | Corrección manual completada por el docente |

---

## 8. Notas de implementación

- Las preguntas se almacenan como JSON en la tabla `evaluations` con campo `questions: jsonb`.
- Las respuestas del alumno en tabla `evaluation_attempts` con campo `answers: jsonb`.
- Las notas de partes manuales en tabla `manual_corrections` con relación al intento.
- El sistema calcula la nota final combinando score automático + score manual al completar la corrección.
- Los uploads de TP se almacenan en Supabase Storage bajo el path `tps/{curso_id}/{alumno_id}/{filename}`.
- Los links externos (Drive, GitHub, URL) se guardan como strings en el campo `submission_url`.

---

*INCADEducativa · ADDENDUM 01 · Motor de Evaluaciones y Entregas*
*INCADE Escuela de Negocios — Posadas, Misiones*
