# INCADEducativa — Checklist de Funcionalidades

> **Proyecto:** INCADE Digital Hub · incadeducativa.com  
> **Versión:** Spec v3.4 + Design System v2.0  
> **Etapas:** E1 = Plataforma Educativa (producto central) · E2 = Coworking + Servicios · E3 = Apertura Pública  
> **Leyenda:** `[ ]` pendiente · `[x]` implementado · `E1/E2/E3` = etapa de activación

---

## 1. SISTEMA TRANSVERSAL (todas las etapas)

### 1.1 Autenticación y Perfiles

- [x] Login con email + contraseña (todos los roles) — verificado con 2 roles de prueba (admin/alumno), sesión persistente ~30 días, redirect por rol vía middleware (`/admin` protegido, `/dashboard` compartido con sidebar adaptado por rol)
- [ ] Activación de cuenta por email (link de activación) — **parcial**: la pantalla `/activar-cuenta` y el mecanismo de confirmación (`/auth/confirm`, comparte `verifyOtp` con recuperación) ya están armados y compilan, pero no se probó de punta a punta porque depende de la importación CSV (Sprint 1b, genera la invitación real) y de Resend (`RESEND_API_KEY` sin configurar)
- [x] Recuperación de contraseña — flujo de pedido (`/recuperar`) verificado en navegador end-to-end; el envío real del email depende de Resend (no configurado todavía), pero el mecanismo de confirmación es el mismo que ya se probó
- [ ] Un solo perfil unificado para coworking + educativa — sin cambios, el módulo coworking todavía no existe (Etapa 2)
- [ ] Asignación de rol al momento de creación de cuenta — diferido a Sprint 1b (importación CSV); por ahora los roles de prueba se asignaron manualmente
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
- [ ] Contenido aprobado o rechazado → Email · al docente · `E1`
- [ ] Anuncio del docente al grupo (`ANNOUNCEMENT`) → In-app (Realtime) + Email · alumnos inscriptos · `E1`
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

- [ ] Importar base inicial de alumnos y docentes (CSV con DNI + carrera/materia) · `E1`
- [ ] CRUD completo de usuarios (crear, editar, desactivar)
- [ ] Asignar y cambiar roles a cualquier usuario
- [ ] Convertir un usuario `comunidad`/`lead` a Alumno INCADE: asignar DNI + carrera (`convert_user_role()`, conversión aditiva con notificación) · `E1`
- [ ] Habilitar `can_teach` a un alumno y asignarle cursos a dictar (rol dual docente, granular por curso) · `E1`
- [ ] Ver historial de conversiones de rol de un usuario (`role_history`) · `E1`
- [ ] Acceder al log de auditoría completo del sistema
- [ ] Habilitar y deshabilitar feature flags por módulo

### 2.2 Módulo Coworking — Admin (servicio independiente) · `E2`

> El Coworking es un servicio con revenue propio, abierto a la comunidad. Acceso público desde E2 (ADR-13).

- [ ] CRUD completo de sedes físicas
- [ ] CRUD completo de espacios por sede (hot desks, salas, aulas)
- [ ] Configurar precios públicos y % de descuento institucional por rol
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

- [ ] Crear, editar y publicar carreras, cursos y módulos
- [ ] Habilitar y deshabilitar permisos granulares a cada docente
- [ ] Revisar cola de curación: aprobar o rechazar contenido enviado por docentes
- [ ] Enviar feedback al docente sobre contenido rechazado
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

- [ ] Diseñar la estructura del programa: módulos, clases, orden
- [ ] Subir videos, materiales descargables y textos por clase (estado: BORRADOR)
- [ ] Enviar contenido a revisión del Admin (estado: EN REVISIÓN)
- [ ] Recibir feedback del Admin sobre contenido rechazado
- [ ] Editar y reenviar a revisión el contenido rechazado

### 4.2 Gestión de sus Cursos · `E1`

- [ ] Ver progreso y asistencia de sus alumnos
- [ ] Ver reportes básicos de engagement de sus cursos
- [ ] Planificar tutorías virtuales (Meet/Zoom) en sus cursos · `E2`
- [ ] Planificar tutorías presenciales en sede (reserva de aula automática) · `E2`
- [ ] Registrar asistencia a tutorías en vivo · `E2`
- [ ] Cargar grabación de tutoría post-sesión · `E2`

### 4.3 Motor de Evaluaciones · `E1`

> Editor visual de evaluaciones. Misma entidad `evaluation` para cuestionarios, exámenes y TPs (ADR-12).

- [ ] Crear evaluación por tipo: cuestionario de módulo, examen final, entrega de TP
- [ ] Editor visual por bloques con menú de tipos de pregunta (íconos Lucide, < 3 clics por pregunta)
- [ ] Pregunta Verdadero/Falso con fundamentación obligatoria (corrección manual)
- [ ] Pregunta de opción única (radio, una correcta)
- [ ] Pregunta de opción múltiple (checkbox, varias correctas)
- [ ] Pregunta abierta de texto largo (corrección manual)
- [ ] Consigna de entrega de TP (archivo / Drive / GitHub / URL / texto)
- [ ] Reordenar preguntas con drag & drop
- [ ] Configurar peso de cada pregunta y respuesta correcta
- [ ] Configuración global: tiempo límite, nota mínima, intentos permitidos, espera entre intentos, resultado inmediato o diferido
- [ ] Guardar como borrador o enviar a revisión junto al contenido
- [ ] Panel de correcciones pendientes: badge con cantidad por evaluación
- [ ] Corregir manualmente: nota parcial + comentario/devolución por alumno
- [ ] Integración automática de score auto + manual en la nota final
- [ ] Panel de resultados por evaluación: notas, promedio del grupo, distribución
- [ ] Exportar resultados a CSV

### 4.4 Canal de Anuncios · `E1`

- [ ] Crear anuncio para el grupo del curso (editor de texto enriquecido)
- [ ] Adjuntar archivo o link al anuncio
- [ ] Seleccionar destinatarios (todos los inscriptos por defecto)
- [ ] Envío simultáneo in-app (Realtime) + email
- [ ] Ver historial de anuncios del curso en orden cronológico inverso
- [ ] Ver indicador de lectura por anuncio

---

## 5. ROL: ALUMNO INCADE

> Los alumnos INCADE son cargados por el Admin con DNI + carrera. No se auto-registran. El sistema envía un email de activación de cuenta.

### 5.1 Onboarding

- [ ] Recibir email de activación con link
- [ ] Activar cuenta y establecer contraseña
- [ ] Completar perfil inicial

### 5.2 Coworking · `E2`

- [ ] Ver catálogo de espacios con descuento institucional aplicado automáticamente
- [ ] Reservar espacios con tarifa preferencial por matrícula activa
- [ ] Ver y descargar comprobante QR de cada reserva
- [ ] Cancelar reservas propias respetando política de cancelación
- [ ] Ver historial de reservas y consumo de créditos de membresía
- [ ] Canjear puntos por horas de coworking · `E1`

### 5.3 Plataforma Educativa · `E1`

- [ ] Acceder al panel educativo con cursos activos y progreso
- [ ] Ver catálogo de cursos con filtros por área y nivel
- [ ] Inscribirse a cursos gratuitos con un clic (incluye cursos fuera de su carrera, que quedan como "curso adicional" — CU-T01)
- [ ] Inscribirse a cursos pagos (flujo MercadoPago + acceso tras webhook) · `E3`
- [ ] Acceder al contenido con desbloqueo progresivo (clase por clase)
- [ ] Rendir cuestionarios por módulo con feedback inmediato (ver §5.6)
- [ ] Rendir examen final con temporizador
- [ ] Ver score y estado aprobado/reprobado
- [ ] Reintentar examen reprobado pasadas 24hs
- [ ] Descargar certificado digital con QR verificable al aprobar
- [ ] Compartir enlace público de verificación del certificado
- [ ] Ver historial de logros: certificados, cursos aprobados, carreras completadas
- [ ] Ver mapa visual de carrera con nodos bloqueados/desbloqueados según progreso
- [ ] Acumular puntos por módulo completado, taller aprobado y examen aprobado
- [ ] Canjear puntos por beneficios en coworking

### 5.4 Tutorías · `E2`

- [ ] Ver calendario de tutorías de sus cursos
- [ ] Unirse a tutorías virtuales (link de Meet/Zoom generado automáticamente)
- [ ] Unirse a tutorías presenciales (aula reservada automáticamente)
- [ ] Recibir recordatorio 24hs y 1hs antes por Email + WhatsApp
- [ ] Ver grabación de tutoría post-sesión

### 5.5 Reserva de Coworking desde la Plataforma Educativa · `E2`

- [ ] Reservar escritorio o sala de estudio desde el panel educativo sin salir de la app
- [ ] Descuento institucional aplicado automáticamente al reservar

### 5.6 Evaluaciones y Entregas · `E1`

> Estados del intento: BLOQUEADA → DISPONIBLE → EN CURSO → PENDIENTE CORRECCIÓN → APROBADA / DESAPROBADA / CORREGIDA.

- [ ] Ver evaluaciones del curso con su estado (bloqueada / disponible / aprobada…)
- [ ] Rendir cuestionario de módulo y examen final (con temporizador si está configurado)
- [ ] Responder Verdadero/Falso con fundamentación
- [ ] Responder opción única y opción múltiple
- [ ] Responder pregunta abierta de texto largo
- [ ] Entregar TP: subir archivo (Storage)
- [ ] Entregar TP: link de Google Drive
- [ ] Entregar TP: link de GitHub
- [ ] Entregar TP: URL externa
- [ ] Entregar TP: texto en plataforma
- [ ] Ver resultado automático inmediato (cuando la evaluación no requiere corrección manual)
- [ ] Recibir notificación in-app + email cuando el docente corrige TP o pregunta abierta
- [ ] Ver nota final (auto + manual) y devolución del docente
- [ ] Reintentar evaluación desaprobada según intentos y espera configurados

### 5.7 Centro de Notificaciones · `E1`

- [ ] Campana en topbar con badge de no leídas (Supabase Realtime)
- [ ] Panel desplegable con preview de las últimas notificaciones
- [ ] Click en notificación → navega al recurso (anuncio, corrección, certificado…)
- [ ] Marcar como leída individual y "marcar todas como leídas"
- [ ] Distinción visual entre leídas y no leídas
- [ ] Preferencias por canal: email y WhatsApp activables (in-app siempre activo)
- [ ] Tipos soportados: anuncio, tutoría, corrección, contenido publicado, certificado, puntos, pago, sistema

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

- [ ] Reproductor de video embebido
- [ ] Materiales descargables adjuntos por clase
- [ ] Texto/transcripción de la clase
- [ ] Desbloqueo progresivo: la clase siguiente se habilita al completar la anterior
- [ ] Registro de `lesson_progress` al completar cada clase
- [ ] Barra de progreso actualizada en tiempo real

### 8.2 Certificados Digitales

- [ ] Generación automática del PDF al aprobar el examen final (< 10 segundos)
- [ ] QR único por certificado codificando URL de verificación pública
- [ ] Verificación pública sin login (URL activa permanentemente)
- [ ] Certificado de especialización al completar una carrera completa
- [ ] Admin puede editar nombre y regenerar el certificado

### 8.3 Sistema de Puntos (Ledger Append-Only)

- [ ] Acumulación automática al completar módulos
- [ ] Acumulación automática al aprobar talleres
- [ ] Acumulación automática al aprobar examen final
- [ ] Canje de puntos por horas de coworking
- [ ] Historial de puntos visible para el alumno
- [ ] Ledger append-only: los puntos nunca se editan, solo se registran movimientos

### 8.4 Mapa Visual de Carreras

- [ ] Nodos iluminados (completados), activos y bloqueados
- [ ] Prerequisitos respetados: no se puede avanzar sin completar el anterior
- [ ] Certificado de especialización visible al final del mapa
- [ ] Progreso visual en tiempo real

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
