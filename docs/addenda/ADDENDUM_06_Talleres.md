# ADDENDUM 06 — Talleres: Contenido en Vivo Autorado por Admin
**INCADEducativa · Spec v3 — Addendum**
**Fecha:** Julio 2026
**Autores:** JosegmeDev + Alan Schwegler

> ⚠️ **DOCUMENTO ARCHIVADO — referencia histórica, no editar.**
> Su contenido fue integrado por completo en `docs/INCADEducativa_Spec_v3.md` v3.6
> (§5.1 CU-08, §6.5, §10.4, ADR-18), `docs/FUNCIONALIDADES.md` (§5.5) y
> `supabase/migrations/019_talleres.sql`. La fuente de verdad vigente es el Spec v3.6.

---

## Contexto

La Spec v3.5 trata Talleres como una línea en la tabla de módulos (§2.2,
`servicios/talleres`, `FEATURE_TALLERES`, Etapa 2) sin desarrollar ningún flujo, caso de
uso ni schema — es, de los tres módulos de servicio (Coworking, Tutorías, Talleres), el
menos desarrollado: ni siquiera tenía una sección propia en `FUNCIONALIDADES.md`.

**Ambigüedad de etapa resuelta por este addendum:** el flag es E2, pero casi todo el
consumo real documentado en el spec original (Lead accede a un taller gratuito,
Comunidad compra talleres online) está etiquetado E3, y depende de `FEATURE_PUBLICA`
(todavía en `false`). Este addendum resuelve la ambigüedad acotando el alcance de esta
implementación a **consumo interno E2**: Admin crea y publica el taller, Alumno INCADE ya
logueado se inscribe y asiste. El flujo de Lead/Comunidad (registro público, taller
gratuito como imán de marketing, nurturing post-taller) queda explícitamente diferido a
cuando se active `FEATURE_PUBLICA` en Etapa 3 — no se toca en esta pasada.

---

## 1. Redefinición del módulo Talleres

### 1.1 Posicionamiento

| Atributo | Definición |
|---|---|
| **Tipo** | Contenido en vivo con feature flag `FEATURE_TALLERES` (Etapa 2, alcance interno) |
| **Autoría** | 100% Admin — sin rol Docente involucrado (a diferencia de cursos y tutorías) |
| **Modalidad** | Virtual (link), con grabación disponible después |
| **Pago** | Sin flujo de pago en esta pasada — beneficio incluido para Alumno INCADE |
| **Puntos** | No otorga puntos todavía (diferido, sin fecha — mismo estado que tenía en el spec original) |

### 1.2 Roles

| Rol | Qué puede hacer |
|---|---|
| **Admin** | Crea, edita, publica/despublega/cancela el taller; carga el link de grabación después del evento |
| **Alumno INCADE logueado** | Ve talleres publicados, se inscribe (respeta capacidad si está seteada), se desinscribe, ve el link el día del evento y la grabación después |
| **Docente / Coordinador** | Sin acción propia — ningún documento original les asigna un rol en Talleres |

**ADR-18 (ver spec):** Talleres es contenido 100% autorado por Admin — no hay flujo de
revisión Docente↔Admin (no aplica ADR-06 de curación porque no hay autor previo que
curar). Evita construir un segundo motor de publicación paralelo al de cursos sin que
ningún documento lo pida.

---

## 2. Casos de uso

### CU-TA01 — Admin crea y publica un taller

| Campo | Detalle |
|---|---|
| **Actor** | Admin |
| **Precondición** | `FEATURE_TALLERES=true` |
| **Flujo principal** | 1. Admin completa título, descripción, fecha/hora, duración, link virtual, capacidad (opcional) → 2. Guarda como `borrador` → 3. Publica cuando está listo (`estado='publicado'`) |
| **Postcondición** | Taller visible para cualquier Alumno INCADE logueado en `/talleres` |

### CU-TA02 — Alumno se inscribe a un taller publicado

| Campo | Detalle |
|---|---|
| **Actor** | Alumno INCADE logueado (o cualquier usuario autenticado — no se restringe por rol, mismo criterio que la inscripción a cursos gratuitos) |
| **Precondición** | Taller en estado `publicado`. Si tiene `capacidad` seteada, no está llena |
| **Flujo principal** | 1. Alumno ve el taller en "Disponibles" → 2. Click "Inscribirme" → 3. Sistema valida capacidad (server-side, no es un recurso físico único como una reserva de Coworking, no hace falta un `exclude constraint`) → 4. Queda inscripto, aparece en "Mis talleres" |
| **Alternativas** | A1: capacidad llena → botón deshabilitado. A2: el alumno se desinscribe antes del evento |
| **Postcondición** | Fila en `taller_inscripciones` |

### CU-TA03 — Alumno asiste y ve la grabación

| Campo | Detalle |
|---|---|
| **Actor** | Alumno inscripto |
| **Flujo principal** | 1. El día del taller, ve el link virtual en "Mis talleres" → 2. Después del evento, el Admin edita el taller y pega el link de grabación → 3. El alumno lo ve en la misma sección |
| **Simplificación documentada** | No hay registro de asistencia real (solo inscripción) ni recordatorios automáticos — ningún documento original los pide para Talleres, a diferencia de Tutorías. Si se necesitan más adelante, se agregan sin romper lo existente |

---

## 3. Schema propuesto

| Tabla | Campos clave | Notas |
|---|---|---|
| `talleres` | `id, titulo, descripcion, fecha_inicio, duracion_minutos, link_virtual, grabacion_url, capacidad, estado, created_at` | `estado`: borrador / publicado / cancelado (más simple que `course_status` — sin `revision`/`archivado`, no hay flujo docente→admin). `capacidad` nullable = sin límite |
| `taller_inscripciones` | `id, taller_id, user_id, inscrito_at` | `unique(taller_id, user_id)` |

**RLS** (reusa `is_admin()` de la 001, sin funciones nuevas):
- Select de `talleres`: `is_admin()` o (`auth.uid() is not null` y `estado='publicado'`).
- Insert de `taller_inscripciones`: `user_id = auth.uid()` y el taller referenciado está
  `publicado` — sin restricción de `role`, mismo criterio que `enrollments` de cursos.

---

## 4. Feature flag y activación

```
FEATURE_TALLERES=true   → activa el módulo (lista para Admin y para Alumno)
FEATURE_TALLERES=false  → la sección no aparece en ningún lado
```

Etapa 2, alcance interno. No depende de `FEATURE_PUBLICA`/`FEATURE_COMUNIDAD` en esta
pasada — el flujo de Lead/Comunidad público queda para cuando se active `FEATURE_PUBLICA`
en Etapa 3 (fuera de alcance de este addendum).

---

## 5. Criterios de aceptación

| Criterio | Métrica |
|---|---|
| Admin publica un taller | En menos de 3 clics |
| Alumno se inscribe | En 1 clic, respeta capacidad si está seteada |
| Alumno ve el link/grabación | Sin recargar caché, inmediato tras la carga del Admin |

---

*INCADEducativa · ADDENDUM 06 · Talleres — Contenido en Vivo Autorado por Admin*
*INCADE Escuela de Negocios — Posadas, Misiones*
