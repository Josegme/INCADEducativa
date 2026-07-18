# ADDENDUM 05 — Tutorías: Sesiones Grupales por Curso
**INCADEducativa · Spec v3 — Addendum**
**Fecha:** Julio 2026
**Autores:** JosegmeDev + Alan Schwegler

> ⚠️ **DOCUMENTO ARCHIVADO — referencia histórica, no editar.**
> Su contenido fue integrado por completo en `docs/INCADEducativa_Spec_v3.md` v3.5
> (§5.1 CU-07, §6.4, §10.3, ADR-17), `docs/FUNCIONALIDADES.md` (§4.2, §5.4) y
> `supabase/migrations/018_tutorias.sql`. La fuente de verdad vigente es el Spec v3.5.

---

## Contexto

La Spec v3.4 trata Tutorías como una línea en la tabla de módulos (§2.2, `servicios/tutorias`,
`FEATURE_TUTORIAS`, Etapa 2) sin desarrollar ningún flujo, caso de uso ni schema. Este addendum
lo redefine con el nivel de detalle que ya tienen Evaluaciones (Addendum 01), Comunicación
(Addendum 02) y Coworking (Addendum 03).

**Decisión de alcance clave:** Tutorías es una **sesión grupal ligada a un curso** — el docente
la programa para "sus alumnos" (los inscriptos en ese curso), no es una cita 1:1. El spec ya
reserva el modelo 1:1 para un módulo futuro distinto y no relacionado: `FEATURE_MENTORIA`
(Mentoría 1:1, §7). No confundir ambos módulos en el código ni en el schema.

---

## 1. Redefinición del módulo Tutorías

### 1.1 Posicionamiento

| Atributo | Definición |
|---|---|
| **Tipo** | Submódulo del área educativa, con feature flag `FEATURE_TUTORIAS` (Etapa 2) |
| **Relación con cursos** | Cada tutoría pertenece a un curso (`curso_id`) y a un docente dueño de ese curso |
| **Modalidad** | Virtual (link Meet/Zoom) o presencial (bloquea un aula del módulo Coworking) |
| **Pago** | Sin flujo de pago — beneficio incluido para alumnos inscriptos (uso institucional) |
| **Dependencia** | La modalidad presencial requiere `FEATURE_COWORKING=true` (necesita `spaces` tipo `aula`). Si el flag de Coworking está apagado, solo se ofrece la modalidad virtual |

### 1.2 Roles involucrados

| Rol | Qué puede hacer |
|---|---|
| **Docente** | Programa tutorías (virtual o presencial) para sus cursos, registra asistencia, carga el link de grabación post-sesión |
| **Alumno INCADE inscripto** | Ve el calendario de tutorías de sus cursos, se une (link o aula), recibe recordatorios, ve la grabación luego de la sesión |
| **Admin** | Sin acción propia en esta versión — ninguna funcionalidad del checklist lo requiere. Puede auditar vía RLS (`is_admin()`) como en el resto del sistema |

---

## 2. Casos de uso

### CU-TU01 — Docente programa tutoría virtual

| Campo | Detalle |
|---|---|
| **Actor** | Docente (dueño del curso o `can_teach_course()`) |
| **Precondición** | `FEATURE_TUTORIAS=true`. El docente tiene al menos un curso asignado |
| **Trigger** | Docente entra a "Tutorías" dentro de su panel de curso |
| **Flujo principal** | 1. Elige modalidad "Virtual" → 2. Pega el link de Meet/Zoom (generado fuera de la plataforma) → 3. Elige fecha/hora → 4. Confirma → 5. Sistema notifica a todos los alumnos con inscripción activa en el curso (`tipo='tutoria'`, in-app + email) |
| **Postcondición** | Tutoría en estado `programada`, visible en `/cursos/[slug]` para los alumnos inscriptos |
| **Simplificación documentada** | No hay integración real con la API de Google Meet/Zoom — el link se pega manualmente, mismo criterio que otras simplificaciones del proyecto (ej. enunciado plano en `EvaluationBuilder` en vez de rich-text) |

### CU-TU02 — Docente programa tutoría presencial (bloqueo automático de aula)

| Campo | Detalle |
|---|---|
| **Actor** | Docente |
| **Precondición** | `FEATURE_TUTORIAS=true` y `FEATURE_COWORKING=true`. Existe al menos un espacio tipo `aula` activo |
| **Flujo principal** | 1. Elige modalidad "Presencial" → 2. Elige aula y horario (grilla de disponibilidad, mismo componente que `BookingForm` de Coworking) → 3. Confirma → 4. Sistema crea una reserva en `bookings` (`tipo_descuento='institucional'`, sin fila en `payments`, uso interno) y la vincula a la tutoría → 5. Notifica a los alumnos inscriptos |
| **Alternativas** | A1: el aula ya está ocupada en ese horario → el `exclude constraint no_overlap` de `bookings` rechaza el insert y el docente ve el error antes de confirmar la tutoría (nunca queda una tutoría "fantasma" sin aula real) |
| **Postcondición** | Tutoría vinculada a una reserva `confirmada` de Coworking, sin impacto en `coworking_revenue` (no hay fila en `payments`) |

### CU-TU03 — Alumno ve el calendario y se une

| Campo | Detalle |
|---|---|
| **Actor** | Alumno INCADE con inscripción activa en el curso |
| **Flujo principal** | 1. Entra a `/cursos/[slug]` → 2. Ve la sección "Tutorías": próximas (con link o aula+horario) y pasadas (con grabación si el docente la cargó) → 3. Click en el link/aula para unirse |
| **Postcondición** | N/A — es una acción de solo lectura + navegación, sin cambio de estado |

### CU-TU04 — Recordatorios automáticos

| Campo | Detalle |
|---|---|
| **Actor** | Sistema (cron) |
| **Trigger** | `pg_cron` dispara `/api/cron/tutorias` cada 10 min (mismo patrón que `/api/cron/coworking`) |
| **Flujo principal** | 1. Busca tutorías `programada` a ~24hs y a ~1h de `fecha_inicio` con el flag de recordatorio correspondiente en `false` → 2. Notifica a alumno + docente (in-app + email) → 3. Marca el flag para no reenviar |
| **Postcondición** | `recordatorio_24h_enviado`/`recordatorio_1h_enviado` en `true`. **No se puede probar el disparo automático real en local** (Supabase no alcanza `localhost`) — se verifica con `curl` directo y scripts puntuales, mismo caveat que Coworking desde Sprint 17-18 |
| **Simplificación documentada** | El canal WhatsApp queda fuera de esta pasada: `public.users` no tiene ningún campo de teléfono (a diferencia de `bookings.telefono_contacto`, que es específico de invitados de Coworking, migración 012) — agregarlo tocaría el perfil general de todos los roles sin que ningún flujo de onboarding/CSV lo pida todavía. El recordatorio funciona igual por Email + in-app; WhatsApp se suma cuando exista un campo de teléfono de perfil real |

### CU-TU05 — Docente registra asistencia y carga grabación

| Campo | Detalle |
|---|---|
| **Actor** | Docente |
| **Precondición** | La tutoría ya pasó su `fecha_fin` (cron la marcó `realizada` automáticamente) |
| **Flujo principal** | 1. Docente abre el detalle de la tutoría → 2. Marca presente/ausente por cada alumno inscripto → 3. Pega el link de la grabación (Drive/YouTube no listado) |
| **Simplificación documentada** | Solo se guarda una URL, no hay upload real de archivo de video — el bucket `contenido-cursos` queda disponible para una mejora incremental futura si se necesita |

---

## 3. Schema propuesto

| Tabla | Campos clave | Notas |
|---|---|---|
| `tutorias` | `id, curso_id, docente_id, modalidad, fecha_inicio, fecha_fin, link_virtual, space_id, booking_id, grabacion_url, estado, recordatorio_24h_enviado, recordatorio_1h_enviado, created_at` | `modalidad`: virtual / presencial. `estado`: programada / realizada / cancelada. `space_id`/`booking_id` solo se completan si `modalidad='presencial'` |
| `tutoria_asistencias` | `id, tutoria_id, alumno_id, presente, registrado_at` | `unique(tutoria_id, alumno_id)` — un registro de asistencia por alumno por tutoría |

**Funciones:**
- `detect_completed_tutorias()` — `security definer`, mismo patrón que `detect_completed_bookings()` (migración 017): pasa `programada`→`realizada` cuando `fecha_fin < now()`.

**RLS** (reusa `is_admin()` y `can_teach_course(curso_id)` ya existentes, nunca lógica de rol inline):
- Select: alumno con `enrollments` activa en `curso_id`, o `can_teach_course(curso_id)`, o `is_admin()`.
- Write (all): `can_teach_course(curso_id)` o `is_admin()`.

**Notificaciones:** reusa el valor `'tutoria'` del enum `notification_type`, ya definido desde la
migración `003_motor_evaluaciones_comunicacion.sql` (nunca tuvo un productor real hasta ahora).

---

## 4. Puntos de integración con Coworking

| Integración | Descripción |
|---|---|
| Bloqueo de aula | CU-TU02 crea una reserva `institucional` en `bookings` sin fila en `payments` — no cuenta como revenue, mismo criterio que las reservas en lote de Coordinador |
| Disponibilidad compartida | La grilla de horarios de aula reusa el mismo RPC (`get_occupied_slots()`) y el mismo `exclude constraint no_overlap` que el resto de Coworking — cero doble asignación de aula |
| Dependencia de flag | La modalidad presencial requiere `FEATURE_COWORKING=true`; si está apagado, Tutorías solo ofrece la modalidad virtual |

---

## 5. Feature flag y activación

```
FEATURE_TUTORIAS=true   → activa el módulo (calendario del alumno, panel del docente)
FEATURE_TUTORIAS=false  → la sección no aparece en ningún lado
```

Etapa 2, igual que Coworking. No depende de `FEATURE_PUBLICA` ni `FEATURE_COMUNIDAD` — es un
beneficio exclusivo de alumnos INCADE inscriptos, no del catálogo público.

---

## 6. Criterios de aceptación

| Criterio | Métrica |
|---|---|
| Docente programa una tutoría virtual | En menos de 3 clics |
| Docente programa una tutoría presencial | El aula se bloquea automáticamente, cero doble asignación |
| Alumno ve la tutoría en su curso | Inmediatamente tras la creación (sin recargar caché) |
| Recordatorio 24hs y 1hs | Se envía una sola vez por tutoría (flags anti-duplicado) |
| Auto-completado de tutorías pasadas | `detect_completed_tutorias()` corre cada 5 min vía `pg_cron` |

---

*INCADEducativa · ADDENDUM 05 · Tutorías — Sesiones Grupales por Curso*
*INCADE Escuela de Negocios — Posadas, Misiones*
