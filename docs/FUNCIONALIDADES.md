# INCADEducativa — Checklist de Funcionalidades

> **Proyecto:** INCADE Digital Hub · incadeducativa.com  
> **Versión:** Spec v3.4 + Design System v2.0  
> **Etapas:** E1 = Plataforma Educativa (producto central) · E2 = Coworking + Servicios · E3 = Apertura Pública  
> **Leyenda:** `[ ]` pendiente · `[x]` implementado · `E1/E2/E3` = etapa de activación

---

## 1. SISTEMA TRANSVERSAL (todas las etapas)

### 1.1 Autenticación y Perfiles

- [x] Login con email + contraseña (todos los roles) — verificado con 2 roles de prueba (admin/alumno), sesión persistente ~30 días, redirect por rol vía middleware (`/admin` protegido, `/dashboard` compartido con sidebar adaptado por rol)
- [x] Activación de cuenta por email (link de activación) — verificado de punta a punta: la importación CSV real dispara `inviteUserByEmail`, `/auth/confirm` intercambia el token y `/activar-cuenta` deja la contraseña. El envío efectivo del email depende del SMTP configurado en Supabase (`RESEND_API_KEY` sin configurar todavía), no del código.
- [x] Recuperación de contraseña — flujo de pedido (`/recuperar`) verificado en navegador end-to-end; el envío real del email depende de Resend (no configurado todavía), pero el mecanismo de confirmación es el mismo que ya se probó
- [ ] Un solo perfil unificado para coworking + educativa — sin cambios, el módulo coworking todavía no existe (Etapa 2)
- [x] Asignación de rol al momento de creación de cuenta — la importación CSV asigna `role='alumno'` al crear el perfil; roles distintos se asignan después vía conversión de rol (Admin)
- [x] Logout con limpieza de sesión — verificado en navegador
- [ ] Perfil de usuario: nombre, foto, carrera/área, historial

### 1.2 Notificaciones Automáticas

- [ ] Reserva coworking confirmada → Email + WhatsApp · inmediato · `E2`
- [ ] Comprobante de pago → Email · inmediato · `E2`
- [ ] Recordatorio turno coworking 24hs antes → Email + WhatsApp · `E2`
- [ ] No-show detectado (15 min sin check-in) → Email · usuario + admin · `E2`
- [ ] Cancelación por admin → Email + WhatsApp · inmediato · `E2`
- [ ] Cancelación por usuario → Email · al admin · `E2`
- [ ] Nueva reserva recibida → Email · al admin · `E2`
- [ ] Resumen diario coworking 08:00 AM → Email · admin · `E2`
- [ ] Informe tiempos ociosos lunes 09:00 AM → Email · admin · `E2`
- [ ] Inscripción a curso confirmada → Email · inmediato · `E1`
- [ ] Recordatorio tutoría virtual 24hs y 1hs → Email + WhatsApp · alumno + docente · `E2`
- [ ] Contenido enviado a revisión → Email · al admin · `E1`
- [x] Contenido aprobado o rechazado → Email · al docente · `E1`
- [x] Anuncio del docente al grupo (`ANNOUNCEMENT`) → In-app (Realtime) + Email · alumnos inscriptos · `E1`
- [ ] Comunicado institucional masivo del admin → In-app + Email · cursos/carreras seleccionados · `E1`
- [ ] TP o pregunta abierta corregida → In-app + Email · al alumno · `E1`
- [ ] Cambio de rol / conversión de cuenta → In-app + Email · al usuario convertido · `E1`
- [ ] Secuencia de nurturing post-taller gratuito días 1, 3 y 7 → Email · lead · `E3`

### 1.4 Fundación Visual — Design System v2.0 · `E1`

> Prerrequisito de todo el desarrollo. Completar antes del Sprint 1.

- [x] `src/app/globals.css` con variables `--inc-*` y `--edu-*` del DS §5
- [x] Mapeo shadcn aplicado en `globals.css` según `docs/design/SHADCN_THEME.md`
- [x] `tailwind.config.ts` extendido con colores `inc` / `edu`, radios y sombras del DS §5
- [x] Inter cargada desde Google Fonts — verificado (`document.fonts.check` confirma pesos 400/600/700 `loaded`)
- [x] Lucide React instalado como única librería de íconos (`lucide-react`)
- [x] `<html className="dark">` en `layout.tsx` — dark mode activo
- [x] Shell: `AuthLayout` vacío con fondo `--edu-bg`
- [x] Shell: `DashboardLayout` vacío con sidebar `--edu-surface` y topbar con blur
- [x] Shell: `Sidebar` con ítems de nav por rol (tokens DS, Lucide icons) — componente listo, recibe `items` por prop; la carga de ítems reales por rol es Sprint 1–2
- [x] Shell: `Topbar` con logo mark "IN" (`--inc-violet`) y avatar de usuario
- [x] Componentes base tematizados: `Button` (primary/outline/destructive/ghost), `Card`, `Input`
- [x] Componentes de estado LMS: `Badge` (6 estados: active/completed/pending/error/locked/gold)
- [x] `Progress` con gradiente `--inc-violet → --inc-magenta`
- [ ] `CertificateCard` con tokens dorado (`--edu-gold`) exclusivos — diferido a Sprint 9–10 (no está en el checklist de `PRIMEROS_PASOS.md` Paso 4; ver nota de consistencia entregada al usuario)
- [x] Banners de notificación: info/success/warning/danger con tokens semánticos
- [x] Página `/design-preview` con muestra de todos los componentes base
- [x] QA visual: contraste WCAG AA verificado — texto blanco sobre `--edu-bg` ≈ 19.6:1; texto blanco sobre `--inc-violet` (CTA primario) ≈ 4.93:1 (AA normal-text ≥ 4.5:1)
- [x] Ningún hex hardcodeado en componentes — solo tokens CSS variables o clases Tailwind. Resuelto: se agregaron los tokens `--inc-violet-text`, `--inc-magenta-text`, `--edu-success-text`, `--edu-warning-text`, `--edu-danger-text` al DS v2.1 (`DESIGN_SYSTEM_INCADEducativa.md`, `COMPONENTS.md` v1.1) y se refactorizaron `Badge`, `Sidebar`, `Topbar` y `NotificationBanner` para usarlos en vez de hex literales

---

- [ ] Crear preference de pago vía API
- [ ] Checkout embebido (Brick) o Checkout Pro en mobile
- [ ] Webhook `payment.created` como única fuente de verdad del estado
- [ ] Verificación de firma `x-signature` en cada webhook
- [ ] Pago aprobado → reserva confirmada o acceso a curso habilitado
- [ ] Pago rechazado → slot liberado a los 10 minutos
- [ ] Descuentos y cupones aplicados automáticamente según rol
- [ ] Descuento institucional automático para alumnos INCADE activos

---

## 2. ROL: ADMINISTRADOR

### 2.1 Gestión del Sistema

- [x] Importar base inicial de alumnos y docentes (CSV con DNI + carrera/materia) · `E1` — `ImportCsvModal` en `/admin/usuarios`, columnas `nombre,apellido,dni,email,carrera`, preview con detección de duplicados y carrera sin match antes de confirmar
- [ ] CRUD completo de usuarios (crear, editar, desactivar) — **parcial**: alta por CSV y conversión de rol listas; falta editar datos de un usuario existente y desactivar (`activo=false`)
- [x] Asignar y cambiar roles a cualquier usuario — `ConvertRoleModal`, llama a `convert_user_role()`
- [x] Convertir un usuario `comunidad`/`lead` a Alumno INCADE: asignar DNI + carrera (`convert_user_role()`, conversión aditiva con notificación) · `E1`
- [ ] Habilitar `can_teach` a un alumno y asignarle cursos a dictar (rol dual docente, granular por curso) · `E1` — **parcial**: el toggle de `can_teach` (`CanTeachToggle`) está listo; falta la asignación de curso porque el catálogo de cursos todavía no tiene backend real
- [x] Ver historial de conversiones de rol de un usuario (`role_history`) · `E1` — `RoleHistoryTimeline`, resuelve el admin que hizo cada cambio
- [ ] Acceder al log de auditoría completo del sistema
- [ ] Habilitar y deshabilitar feature flags por módulo

### 2.2 Módulo Coworking — Admin (servicio independiente) · `E2`

> El Coworking es un servicio con revenue propio, abierto a la comunidad. Acceso público desde E2 (ADR-13).

- [x] CRUD completo de sedes físicas — `/admin/coworking/sedes`, `LocationModal`/`LocationActiveToggle`, verificado en navegador (alta/edición/activar/desactivar)
- [x] CRUD completo de espacios por sede (hot desks, salas, aulas) — `/admin/coworking/espacios`, `SpaceModal`/`SpaceActiveToggle`, verificado en navegador
- [x] Configurar precios públicos y % de descuento institucional por rol — precio/hora por espacio (`SpaceModal`) + descuento vía `get_user_discount()` (ya definida en la 002, 30% para alumno/docente/coordinador), aplicado en la landing pública
- [ ] Configurar cupones de descuento y campañas de early bird
- [ ] Ver disponibilidad de todos los espacios en tiempo real
- [ ] Ver, modificar y cancelar cualquier reserva del sistema
- [ ] Crear reservas manuales sin pago online (`tipo_descuento = manual`, acuerdos directos)
- [ ] Bloquear aula automáticamente al agendarse una tutoría presencial (uso institucional)
- [ ] Cancelar reserva con generación automática de notificación al usuario
- [ ] Registrar incidencias de mantenimiento por espacio. Historial visible
- [ ] Gestionar membresías: alta, baja, renovación y ajuste de créditos

#### Check-in

- [ ] Vista "Lista del día": reservas ordenadas por hora con botón "Presente"
- [ ] Botón "Presente" registra timestamp y cambia reserva a EN USO
- [ ] Detección automática de no-show: cron cada 5 min, marca a los 15 min sin check-in
- [ ] Escanear QR como método alternativo de check-in
- [ ] Validación QR: ±15 min de margen horario, estado CONFIRMADA requerido

#### Reportes Coworking

- [ ] Dashboard con métricas en tiempo real: ocupación, ingresos, reservas activas
- [ ] **Panel de ingresos independiente del módulo educativo** (vista `coworking_revenue`): por período, sede y tipo de usuario (institucional vs público)
- [ ] Análisis de ocupación: gráficos de espacios más usados y horarios pico
- [ ] Informe de tiempos ociosos con recomendaciones
- [ ] Exportar reportes en PDF y Excel (reservas, ingresos, ocupación)

### 2.3 Módulo Educativo — Admin · `E1`

- [x] Crear, editar y publicar carreras, cursos y módulos — carreras/cursos top-level
      (`/admin/carreras`, `/admin/cursos`, publicar/despublicar); módulos y clases los carga
      el Docente en `/docente/cursos/[id]` (`CourseEditor`, §27 de COMPONENTS.md)
- [ ] Habilitar y deshabilitar permisos granulares a cada docente
- [x] Revisar cola de curación: aprobar o rechazar contenido enviado por docentes —
      `ReviewActions` (§29) en `/admin/cursos`, filas en `estado='revision'`
- [x] Enviar feedback al docente sobre contenido rechazado — motivo obligatorio al rechazar,
      guardado en `courses.revision_comentario` y visible en `CourseEditor` (banner de rechazo)
- [ ] Publicar cursos, talleres y programas (única entidad que puede publicar)
- [ ] Editar nombre en certificado emitido y regenerar PDF
- [ ] Ver métricas académicas: progreso de alumnos, reportes de engagement

### 2.4 Plataforma Abierta — Admin · `E3`

- [ ] Gestionar leads: ver base de datos, filtrar por área de interés
- [ ] Exportar base de marketing (leads + usuarios comunidad)
- [ ] Configurar suscripciones y precios para usuarios externos
- [ ] Configurar secuencias de nurturing por email

---

## 3. ROL: COORDINADOR DE CURSOS

### 3.1 Coworking · `E2`

- [ ] Ver disponibilidad de espacios en calendario en tiempo real
- [ ] Reservar el mismo espacio durante N semanas consecutivas (reservas en lote)
- [ ] Cancelar reservas propias respetando política de cancelación configurada
- [ ] Ver historial de sus reservas y estados de pago
- [ ] Ver y descargar comprobante QR de cada reserva
- [ ] Recibir notificaciones de confirmación, recordatorio y cancelación

### 3.2 Educativo · `E1` (requiere permiso habilitado por Admin)

- [ ] Cargar materiales y contenidos en cursos asignados
- [ ] Ver progreso y asistencia de alumnos en sus cursos

---

## 4. ROL: DOCENTE / INSTRUCTOR

> ⚠️ El docente nunca puede publicar directamente. Todo pasa por curación del Admin.

### 4.1 Creación de Contenido · `E1`

- [x] Diseñar la estructura del programa: módulos, clases, orden — `CourseEditor` (§27),
      reordenar módulos y clases con drag (`@dnd-kit`)
- [x] Subir videos y textos por clase (estado: BORRADOR) — `LessonUploader` (§28) para
      video/documento, textarea directo para texto. **Materiales descargables *adjuntos*
      (attachments aparte del contenido principal de la clase) siguen diferidos**, no hay
      columna/tabla para eso todavía (ver §8.1)
- [x] Enviar contenido a revisión del Admin (estado: EN REVISIÓN) — botón "Enviar a
      revisión" en `CourseEditor`, requiere al menos un módulo cargado
- [x] Recibir feedback del Admin sobre contenido rechazado — banner en `CourseEditor` con
      `revision_comentario`
- [x] Editar y reenviar a revisión el contenido rechazado — al rechazar el curso vuelve a
      `borrador`, editable de nuevo, mismo botón "Enviar a revisión"

### 4.2 Gestión de sus Cursos · `E1`

- [ ] Ver progreso y asistencia de sus alumnos
- [ ] Ver reportes básicos de engagement de sus cursos
- [ ] Planificar tutorías virtuales (Meet/Zoom) en sus cursos · `E2`
- [ ] Planificar tutorías presenciales en sede (reserva de aula automática) · `E2`
- [ ] Registrar asistencia a tutorías en vivo · `E2`
- [ ] Cargar grabación de tutoría post-sesión · `E2`

### 4.3 Motor de Evaluaciones · `E1`

> Editor visual de evaluaciones. Misma entidad `evaluation` para cuestionarios, exámenes y TPs (ADR-12).

- [x] Crear evaluación por tipo: cuestionario de módulo, examen final, entrega de TP
- [x] Editor visual por bloques con menú de tipos de pregunta (íconos Lucide, < 3 clics por pregunta)
- [x] Pregunta Verdadero/Falso con fundamentación obligatoria (corrección manual)
- [x] Pregunta de opción única (radio, una correcta)
- [x] Pregunta de opción múltiple (checkbox, varias correctas)
- [x] Pregunta abierta de texto largo (corrección manual)
- [x] Consigna de entrega de TP (archivo / Drive / GitHub / URL / texto)
- [x] Reordenar preguntas con drag & drop
- [x] Configurar peso de cada pregunta y respuesta correcta
- [x] Configuración global: tiempo límite, nota mínima, intentos permitidos, espera entre intentos, resultado inmediato o diferido
- [x] Guardar como borrador o enviar a revisión junto al contenido
- [x] Panel de correcciones pendientes (lista en la página de la evaluación —
      sin badge de cantidad en la navegación, mejora incremental)
- [x] Corregir manualmente: nota parcial + comentario/devolución por alumno
- [x] Integración automática de score auto + manual en la nota final (trigger
      `apply_manual_correction`, 003)
- [x] Panel de resultados por evaluación: notas, promedio del grupo (sin
      distribución gráfica — tabla alcanza para el caso de uso principal)
- [ ] Exportar resultados a CSV

### 4.4 Canal de Anuncios · `E1`

- [x] Crear anuncio para el grupo del curso (texto plano, no rich-text — ver `COMPONENTS.md` §33)
- [x] Adjuntar link al anuncio (no upload de archivo — mismo criterio que arriba)
- [x] Seleccionar destinatarios (todos los inscriptos por defecto)
- [x] Envío simultáneo in-app (Realtime) + email
- [x] Ver historial de anuncios del curso en orden cronológico inverso
- [x] Ver indicador de lectura por anuncio

---

## 5. ROL: ALUMNO INCADE

> Los alumnos INCADE son cargados por el Admin con DNI + carrera. No se auto-registran. El sistema envía un email de activación de cuenta.

### 5.1 Onboarding

- [ ] Recibir email de activación con link
- [ ] Activar cuenta y establecer contraseña
- [ ] Completar perfil inicial

### 5.2 Coworking · `E2`

- [x] Ver catálogo de espacios con descuento institucional aplicado automáticamente — `/servicios/coworking`, `get_user_discount()`
- [x] Reservar espacios con tarifa preferencial por matrícula activa — `BookingForm`, verificado en navegador con `alumno.test` (30% aplicado, $1200→$840)
- [ ] Ver y descargar comprobante QR de cada reserva — **parcial**: `BookingConfirmation` genera el QR on-the-fly cuando `estado='confirmada'` (código verificado, nunca ejecutado con un pago real — depende del webhook de MP, sin token en este entorno)
- [ ] Cancelar reservas propias respetando política de cancelación — Sprint 15-16
- [ ] Ver historial de reservas y consumo de créditos de membresía — Sprint 17-18 (membresías) + falta un listado "Mis reservas"
- [ ] Canjear puntos por horas de coworking · `E1` — Sprint 19-20, explícitamente fuera de alcance

### 5.3 Plataforma Educativa · `E1`

- [ ] Acceder al panel educativo con cursos activos y progreso
- [x] Ver catálogo de cursos con filtros por área y nivel — `/cursos` conectado a `public.courses` real, filtro por carrera (`FilterBar`) y nivel
- [x] Inscribirse a cursos gratuitos con un clic (incluye cursos fuera de su carrera, que quedan como "curso adicional" — CU-T01) — `enrollUserAction` real sobre `enrollments`
- [ ] Inscribirse a cursos pagos (flujo MercadoPago + acceso tras webhook) · `E3`
- [x] Acceder al contenido con desbloqueo progresivo (clase por clase)
- [x] Rendir cuestionarios por módulo con feedback inmediato (ver §5.6)
- [x] Rendir examen final con temporizador
- [x] Ver score y estado aprobado/reprobado
- [x] Reintentar examen reprobado pasadas 24hs (configurable, default 24hs)
- [x] Descargar certificado digital con QR verificable al aprobar
- [x] Compartir enlace público de verificación del certificado
- [ ] Ver historial de logros: certificados, cursos aprobados, carreras completadas
      (`/certificados` lista certificados; historial unificado con cursos/carreras
      queda pendiente, no requiere schema nuevo)
- [ ] Ver mapa visual de carrera con nodos bloqueados/desbloqueados según progreso
- [x] Acumular puntos por módulo completado y examen aprobado (taller es `E2`,
      sin producir puntos todavía)
- [ ] Canjear puntos por beneficios en coworking · `E2`

### 5.4 Tutorías · `E2`

- [ ] Ver calendario de tutorías de sus cursos
- [ ] Unirse a tutorías virtuales (link de Meet/Zoom generado automáticamente)
- [ ] Unirse a tutorías presenciales (aula reservada automáticamente)
- [ ] Recibir recordatorio 24hs y 1hs antes por Email + WhatsApp
- [ ] Ver grabación de tutoría post-sesión

### 5.5 Reserva de Coworking desde la Plataforma Educativa · `E2`

- [x] Reservar escritorio o sala de estudio desde el panel educativo sin salir de la app — ítem "Coworking" en el sidebar de `(dashboard)` lleva a `/servicios/coworking` (mismo dominio/sesión, no un widget embebido en el dashboard)
- [x] Descuento institucional aplicado automáticamente al reservar

### 5.6 Evaluaciones y Entregas · `E1`

> Estados del intento: BLOQUEADA → DISPONIBLE → EN CURSO → PENDIENTE CORRECCIÓN → APROBADA / DESAPROBADA / CORREGIDA.

- [x] Ver evaluaciones del curso con su estado (bloqueada / disponible / aprobada…)
- [x] Rendir cuestionario de módulo y examen final (con temporizador si está configurado)
- [x] Responder Verdadero/Falso con fundamentación
- [x] Responder opción única y opción múltiple
- [x] Responder pregunta abierta de texto largo
- [x] Entregar TP: subir archivo (Storage, bucket `entregas-tp`)
- [x] Entregar TP: link de Google Drive
- [x] Entregar TP: link de GitHub
- [x] Entregar TP: URL externa
- [x] Entregar TP: texto en plataforma
- [x] Ver resultado automático inmediato (cuando la evaluación no requiere corrección manual)
- [x] Recibir notificación in-app + email cuando el docente corrige TP o pregunta abierta
- [x] Ver nota final (auto + manual) y devolución del docente
- [x] Reintentar evaluación desaprobada según intentos y espera configurados

### 5.7 Centro de Notificaciones · `E1`

- [x] Campana en topbar con badge de no leídas (Supabase Realtime)
- [x] Panel desplegable con preview de las últimas notificaciones
- [x] Click en notificación → navega al recurso (resuelto para `announcement` y revisión de
      curso, únicos tipos con productor hoy — ver `COMPONENTS.md` §32)
- [x] Marcar como leída individual y "marcar todas como leídas"
- [x] Distinción visual entre leídas y no leídas
- [x] Preferencias por canal: email y WhatsApp activables (in-app siempre activo)
- [x] Tipos soportados: anuncio, tutoría, corrección, contenido publicado, certificado, puntos, pago, sistema

---

## 6. ROL: USUARIO COMUNIDAD ONLINE · `E3`

> Registro libre por email + contraseña. Catálogo educativo abierto en E3. Reserva de Coworking a precio público desde E2 (sin descuento institucional).

- [ ] Reservar Coworking a precio público con registro mínimo · `E2`
- [ ] Registrarse con email y contraseña
- [ ] Ver catálogo público de cursos sin login
- [ ] Comprar cursos individuales (flujo MercadoPago)
- [ ] Suscribirse mensualmente para acceso a catálogo
- [ ] Acceder a contenido tras confirmación de pago
- [ ] Completar clases, cuestionarios y examen final
- [ ] Obtener certificado digital con QR verificable
- [ ] Acceder a tutorías como add-on pago según el curso contratado
- [ ] Participar en talleres en vivo
- [ ] Ver carreras como vitrina (descripción, materias, salida laboral) pero **sin opción de compra** — CTA "Inscribite en el Instituto" → admisiones presenciales (CU-T02, ADR-15) · `E1`
- [ ] Ser convertido a Alumno INCADE por el Admin tras matrícula presencial (conversión aditiva, conserva historial — CU-T04) · `E1`

---

## 7. ROL: LEAD / VISITANTE · `E2`/`E3`

- [ ] Reservar Coworking a precio público con registro mínimo · `E2`
- [ ] Registrarse para acceder a un taller gratuito · `E3`
- [ ] Quedar registrado en la base de marketing de INCADE con área de interés
- [ ] Acceder al taller gratuito de forma inmediata tras registro
- [ ] Ver carreras como vitrina con CTA a admisiones presenciales (no comprable — CU-T02, ADR-15) · `E1`
- [ ] Recibir secuencia de nurturing por email días 1, 3 y 7
- [ ] Convertirse en Usuario Comunidad Online al pagar su primer curso (automático por webhook MP — CU-T03) · `E3`
- [ ] Ser convertido directamente a Alumno INCADE por el Admin tras matrícula presencial (CU-T05) · `E1`

---

## 8. FUNCIONALIDADES DE LA PLATAFORMA (sin rol específico)

### 8.1 Player de Clases

- [x] Reproductor de video embebido — `LessonPlayer`, video servido desde Storage
      (`contenido-cursos`) con URL firmada
- [ ] Materiales descargables *adjuntos* por clase (además del contenido principal) —
      **sigue diferido**: `LessonUploader` (§28 de COMPONENTS.md, Sprint 7a) ya sube el
      contenido principal de una clase `tipo='documento'`, pero un adjunto *extra* sobre una
      clase de video necesitaría una tabla propia (`lessons` no tiene columna para eso)
- [x] Texto/transcripción de la clase — `ContentViewer` (`tipo='texto'`)
- [x] Desbloqueo progresivo: la clase siguiente se habilita al completar la anterior
- [x] Registro de `lesson_progress` al completar cada clase — guardado debounced (~10s) +
      al finalizar el video o marcar como completada
- [x] Barra de progreso actualizada en tiempo real — `enrollments.progreso_pct` vía el
      trigger `trg_progress_recalc` (001), sin cálculo manual en la app

### 8.2 Certificados Digitales

- [x] Generación automática del PDF al aprobar el examen final — en general, al
      completarse el curso (100% de clases) y quedar aprobadas todas sus
      evaluaciones (`checkAndIssueCertificate`, `src/lib/certificates.ts`),
      no solo el examen final puntual. **Pendiente correr la migración 009**
      (`supabase/migrations/009_certificates_storage.sql`, bucket `certificados` +
      `entregas-tp`) — verificado en navegador que sin ella el registro del
      certificado y los puntos se generan igual (degrada con gracia, loguea el
      error de Storage) pero el PDF no queda subido (`pdf_url` null, sin botón
      de descarga en `/certificados`)
- [x] QR único por certificado codificando URL de verificación pública (`qrcode`)
- [x] Verificación pública sin login (`/verificar/[uuid]`, RPC `verify_certificate`)
- [ ] Certificado de especialización al completar una carrera completa (distinto
      del certificado por curso ya implementado — requeriría agregación por carrera)
- [ ] Admin puede editar nombre y regenerar el certificado

### 8.3 Sistema de Puntos (Ledger Append-Only)

- [x] Acumulación automática al completar clases (+10 c/u, `src/lib/points.ts` vía
      `lessonProgressActions.ts` — el Addendum/checklist decía "módulos", pero
      `LIFECYCLE_PLAN.md` y `CLAUDE.md` definen la regla por **lección**, no por
      módulo completo; se implementó como está especificado ahí)
- [ ] Acumulación automática al aprobar talleres · `E2`
- [x] Acumulación automática al aprobar examen final (+25 — cubierto de forma
      genérica para cualquier evaluación aprobada, no solo examen final)
- [ ] Canje de puntos por horas de coworking · `E2`
- [x] Historial de puntos visible para el alumno (`PointsHistory` en `/dashboard`)
- [x] Ledger append-only: los puntos nunca se editan, solo se registran movimientos
      (triggers de la 001, `award_points()` de la 005 — sin cambios en esta sesión,
      ya estaba correcto, ahora se ejercita de punta a punta)

### 8.4 Mapa Visual de Carreras

- [ ] Nodos iluminados (completados), activos y bloqueados — **frontend-mock listo** (`CareerMap` en `/carreras/[slug]`, solo visible para rol `alumno` — ADR-15), falta progreso real
- [ ] Prerequisitos respetados: no se puede avanzar sin completar el anterior — lógica visual lista sobre datos mock, falta validar contra `enrollments`/`lesson_progress` reales
- [ ] Certificado de especialización visible al final del mapa — nodo final mock listo (tokens `--edu-gold`), falta certificado real (Sprint 9-10)
- [ ] Progreso visual en tiempo real — pendiente de conectar a datos reales

### 8.5 Módulos con Feature Flags

| Módulo | Flag | Etapa |
|---|---|---|
| Auth y perfiles | Siempre activo | E1 |
| Coworking | `FEATURE_COWORKING` | E2 |
| Cursos y carreras | `FEATURE_EDUCATIVA` | E1 |
| Tutorías | `FEATURE_TUTORIAS` | E2 |
| Talleres en vivo | `FEATURE_TALLERES` | E2 |
| Comunidad / foro | `FEATURE_COMUNIDAD` | E3 |
| Catálogo público | `FEATURE_PUBLICA` | E3 |
| Bolsa de trabajo | `FEATURE_EMPLEOS` | Futuro |
| Mentoría 1:1 | `FEATURE_MENTORIA` | Futuro |
| Eventos presenciales | `FEATURE_EVENTOS` | Futuro |
| Biblioteca digital | `FEATURE_BIBLIOTECA` | Futuro |
| Certificaciones externas | `FEATURE_CERT_EXT` | Futuro |

### 8.6 Integración Cross-Módulo

- [ ] Descuento coworking aplicado automáticamente al detectar matrícula activa
- [ ] Coworking muestra cursos disponibles en INCADEducativa (promoción cruzada)
- [ ] INCADEducativa destaca espacios coworking disponibles para estudiar
- [ ] Puntos canjeables entre módulo educativo y módulo coworking

---

## 9. OPERACIONES Y CALIDAD

### 9.1 Tests

- [ ] E2E Etapa 1 (Playwright): inscripción → progreso → examen → certificado
- [ ] E2E Etapa 2 (Playwright): reserva coworking → pago → lista del día → check-in manual → no-show
- [ ] Unit tests (Vitest): lógica de negocio crítica

### 9.2 Infraestructura

- [ ] Deploy en Vercel con GitHub Actions (CI/CD)
- [ ] Preview automático por Pull Request
- [ ] Monitoreo de errores en producción (Sentry)
- [ ] Analytics de performance (Vercel Analytics)
- [ ] RLS (Row-Level Security) activo en Supabase para todos los roles
- [ ] Jobs cron: detección no-show cada 5 min, recordatorios 24hs, resumen diario
- [ ] PWA instalable en mobile (iOS y Android)

---

*Última actualización: Spec v3.4 (Conversión de Roles y Casos de Transición) · Design System v2.0 · INCADEducativa — INCADE Escuela de Negocios, Posadas, Misiones*
