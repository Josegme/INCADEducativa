# ADDENDUM 02 — Canal de Comunicación Docente → Grupo
**INCADEducativa · Spec v3 — Addendum**
**Fecha:** Junio 2026
**Autores:** JosegmeDev + Alan Schwegler

> ⚠️ **DOCUMENTO ARCHIVADO — referencia histórica, no editar.**
> Su contenido fue integrado por completo en `docs/INCADEducativa_Spec_v3.md` v3.4
> (§5 CU-05, §10 `notifications`, ADR-14), `docs/FUNCIONALIDADES.md` (§1.2, §4.4, §5.7),
> `docs/LIFECYCLE_PLAN.md` (Sprints 7-8) y `supabase/migrations/003_motor_evaluaciones_comunicacion.sql`.
> La fuente de verdad vigente es el Spec v3.4.

---

## Contexto

La Spec v3 contempla notificaciones automáticas del sistema (recordatorios de tutoría, confirmaciones de pago, aprobación de contenido) pero no define un canal de comunicación activa del docente hacia su grupo de alumnos. Este addendum define el **módulo de Anuncios y Comunicación** dentro de cada curso.

**Principio de diseño:** el docente escribe un mensaje desde su panel del curso y los alumnos lo reciben inmediatamente por todos los canales disponibles, sin configuración adicional. Cero fricción para el docente.

---

## 1. Canal de anuncios del curso

Cada curso tiene una sección de **Anuncios** accesible tanto para el docente (para escribir) como para los alumnos inscriptos (para leer).

### 1.1 Quién puede enviar anuncios

| Rol | Puede enviar | Audiencia disponible |
|---|---|---|
| Docente | Sí | Todos los alumnos de su curso |
| Admin | Sí | Todos los alumnos de uno o varios cursos |
| Coordinador de Cursos | Sí | Alumnos de los cursos asignados |
| Alumno | No | — (solo lectura) |

### 1.2 Flujo de envío — docente

1. Docente entra a su panel del curso → sección "Anuncios".
2. Hace clic en "+ Nuevo anuncio".
3. Escribe el mensaje en editor de texto enriquecido (soporta negrita, listas, links, imágenes).
4. Opcionalmente adjunta un archivo o link relevante.
5. Selecciona el destinatario: todos los inscriptos (default) o subgrupo por comisión si hubiera.
6. Confirma el envío.
7. El sistema dispara simultáneamente:
   - **Notificación in-app:** badge en el ícono de notificaciones del alumno + ítem en el feed de notificaciones.
   - **Email:** llega al email del alumno con el asunto `[NombreCurso] Nuevo anuncio de tu docente` y el contenido completo del mensaje.
8. El anuncio queda publicado en la sección Anuncios del curso, visible para todos los inscriptos en orden cronológico inverso.

---

## 2. Notificaciones in-app

### 2.1 Centro de notificaciones del alumno

El alumno tiene un ícono de campana en la barra de navegación principal. Muestra el número de notificaciones no leídas.

Al hacer clic despliega un panel con las últimas notificaciones, cada una con:
- Tipo de notificación (anuncio, tutoría, corrección, certificado, etc.)
- Nombre del curso
- Preview del mensaje (primeras 80 caracteres)
- Tiempo transcurrido ("hace 5 minutos", "ayer")
- Estado: leída / no leída

Al hacer clic en una notificación navega directamente al origen (el anuncio en el curso, la evaluación corregida, el calendario de tutorías, etc.).

### 2.2 Tipos de notificación contemplados

| Evento | Generado por | Canal |
|---|---|---|
| Nuevo anuncio del docente | Docente / Admin | In-app + Email |
| Tutoría programada | Docente | In-app + Email + WhatsApp |
| Recordatorio de tutoría (24hs) | Sistema (cron) | In-app + Email + WhatsApp |
| Recordatorio de tutoría (1hs) | Sistema (cron) | In-app + WhatsApp |
| TP / pregunta abierta corregida | Docente | In-app + Email |
| Nuevo contenido publicado en curso | Admin | In-app + Email |
| Certificado emitido | Sistema | In-app + Email |
| Puntos acreditados | Sistema | In-app |
| Curso pago habilitado tras pago | Sistema (webhook MP) | In-app + Email |

### 2.3 Preferencias de notificación del alumno

El alumno puede configurar desde su perfil qué canales recibe para cada tipo de notificación. Los canales disponibles son in-app (siempre activo, no desactivable), email y WhatsApp. Nunca se pueden desactivar las notificaciones de seguridad (cambio de contraseña, acceso nuevo).

---

## 3. Historial de anuncios en el curso

La sección Anuncios del curso muestra todos los anuncios publicados en orden cronológico inverso (más reciente primero). Cada anuncio muestra:

- Avatar y nombre del docente o admin que lo publicó
- Fecha y hora de publicación
- Contenido completo del mensaje
- Adjunto o link si los hubiera
- Indicador de leído/no leído para el alumno

El alumno puede marcar todos como leídos desde un botón de acción rápida.

---

## 4. Anuncios masivos desde el panel Admin

El admin puede enviar anuncios a múltiples cursos simultáneamente, por ejemplo para comunicados institucionales. Flujo:

1. Admin → Panel Admin → Comunicaciones → Nuevo comunicado institucional.
2. Selecciona los cursos o carreras destinatarias (selector múltiple).
3. Redacta el mensaje.
4. El sistema lo publica en los Anuncios de cada curso seleccionado y notifica a todos los alumnos correspondientes.

---

## 5. Integración con el módulo de notificaciones existente

Este módulo extiende la tabla `notifications` ya definida en la Spec, agregando el tipo `ANNOUNCEMENT` con los campos:

- `course_id`: referencia al curso donde se publicó
- `sender_id`: usuario que envió el anuncio (docente o admin)
- `announcement_id`: referencia al registro en tabla `announcements`

Nueva tabla requerida:

```sql
CREATE TABLE announcements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     UUID REFERENCES courses(id) ON DELETE CASCADE,
  sender_id     UUID REFERENCES profiles(id),
  title         TEXT,
  body          TEXT NOT NULL,
  attachment_url TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE announcement_reads (
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES profiles(id),
  read_at         TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (announcement_id, user_id)
);
```

---

## 6. Criterios de aceptación

| Criterio | Métrica |
|---|---|
| El alumno recibe el email del anuncio | En menos de 60 segundos desde el envío |
| La notificación in-app aparece | En menos de 5 segundos (Supabase Realtime) |
| El docente puede enviar un anuncio | En menos de 3 clics desde su panel del curso |
| El historial de anuncios carga | En menos de 1 segundo |

---

*INCADEducativa · ADDENDUM 02 · Canal de Comunicación Docente → Grupo*
*INCADE Escuela de Negocios — Posadas, Misiones*
