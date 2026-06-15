# DOCUMENTACIÓN TÉCNICA INTEGRAL
## INCADEducativa — Plataforma Educativa Digital
### www.incadeducativa.com

---

| Campo | Detalle |
|---|---|
| **Proyecto** | INCADEducativa — Plataforma Educativa + Módulos de Servicio |
| **Versión** | 3.4 — Conversión de Roles y Casos de Uso de Transición |
| **Autores** | Escobar, José Gustavo · Schwegler, Alan |
| **Fecha** | Junio 2026 |
| **Metodología** | Spec-Driven Development (SDD) · Clean Architecture |
| **Stack** | Next.js 14 · Supabase · MercadoPago · Claude API · Vercel |
| **Dominio** | incadeducativa.com (dominio independiente) |
| **Cliente** | Escuela de Negocios INCADE · Posadas, Misiones |

> **DOCUMENTO FUENTE DE VERDAD** — Este spec reemplaza todas las versiones anteriores. Refleja el replanteo acordado con el cliente en junio 2026: plataforma educativa como producto principal con dominio propio, coworking como módulo de servicio integrado.

---

## Índice de Contenidos

1. [Resumen ejecutivo y replanteo estratégico](#1-resumen-ejecutivo-y-replanteo-estratégico)
2. [Arquitectura del producto: plataforma + módulos](#2-arquitectura-del-producto-plataforma--módulos)
3. [Identidad y dominio: incadeducativa.com](#3-identidad-y-dominio-incadeducativacom)
4. [Roles y perfiles del sistema](#4-roles-y-perfiles-del-sistema)
5. [Casos de uso del MVP educativo (Etapa 1)](#5-casos-de-uso-del-mvp-educativo-etapa-1)
6. [Módulo Coworking — integrado como servicio](#6-módulo-coworking--integrado-como-servicio)
7. [Módulos futuros — arquitectura extensible](#7-módulos-futuros--arquitectura-extensible)
8. [Plan de desarrollo por etapas](#8-plan-de-desarrollo-por-etapas)
9. [Stack tecnológico justificado](#9-stack-tecnológico-justificado)
10. [Schema de base de datos](#10-schema-de-base-de-datos)
11. [Flujos críticos del sistema](#11-flujos-críticos-del-sistema)
12. [Criterios de aceptación por módulo](#12-criterios-de-aceptación-por-módulo)
13. [Decisiones de arquitectura (ADRs)](#13-decisiones-de-arquitectura-adrs)
14. [Convenciones Cursor + Claude CLI](#14-convenciones-cursor--claude-cli)

---

## 1. Resumen ejecutivo y replanteo estratégico

La Escuela de Negocios INCADE opera dos sedes activas en Posadas, Misiones. Su presencia digital actual es únicamente una landing estática sin funcionalidad real: no existe login, no hay panel de alumnos, ningún botón ejecuta una acción real.

> **CAMBIO CLAVE respecto a versiones anteriores:** el cliente aprobó la plataforma educativa como producto principal. El coworking pasa a ser un módulo de servicio dentro de la plataforma, no una aplicación paralela. El nuevo producto tiene dominio propio: `incadeducativa.com`.

### 1.1 El problema real

INCADE tiene +20 años de trayectoria, dos sedes físicas, alumnos activos, docentes y una comunidad de egresados. Sin embargo:

- No existe ningún sistema de gestión de alumnos o cursos.
- La gestión de espacios (coworking) es 100% manual.
- No hay plataforma de cursos online ni contenido digital estructurado.
- La comunicación con alumnos es informal (WhatsApp, email manual).
- No existe fidelización ni sistema de puntos o beneficios.

### 1.2 La solución: INCADEducativa

Una plataforma educativa digital con identidad propia que centraliza toda la experiencia del alumno INCADE y abre la institución a la comunidad online nacional.

| Etapa | Nombre | Foco | Público objetivo | Estado |
|---|---|---|---|---|
| **Etapa 1** | MVP Educativo | Plataforma educativa core: cursos, carreras, certificados, panel alumno/docente/admin | Alumnos INCADE + docentes | **Prioridad máxima** |
| **Etapa 2** | Módulo Coworking | Sistema de reservas integrado como servicio dentro de la plataforma | Alumnos INCADE + comunidad Posadas | Post MVP — semanas 11+ |
| **Etapa 3** | Apertura pública | Catálogo abierto, suscripciones, leads, usuarios nacionales | Cualquier persona del país | Planificada — semanas 27+ |

---

## 2. Arquitectura del producto: plataforma + módulos

### 2.1 Concepto central

INCADEducativa es una única PWA Next.js con arquitectura modular. La plataforma educativa es el núcleo. Los servicios como coworking, tutorías, talleres y futuros módulos son **feature flags activables**, no aplicaciones separadas.

> **Un solo dominio · Una sola auth · Un solo perfil de usuario · Módulos activables por feature flag.**  
> Agregar un nuevo servicio en el futuro no requiere una nueva app: se crea un nuevo módulo dentro de la misma plataforma.

### 2.2 Módulos del sistema

| Módulo | Descripción | Etapa | Feature flag |
|---|---|---|---|
| `core/auth` | Auth, perfiles, roles, onboarding | 1 | Siempre activo |
| `educativa/cursos` | Catálogo, clases, progreso | 1 | `FEATURE_EDUCATIVA` (E1, default true) |
| `educativa/carreras` | Carreras estructuradas, mapa de progreso | 1 | `FEATURE_EDUCATIVA` (E1, default true) |
| `educativa/evaluaciones` | Motor de evaluaciones: cuestionarios, exámenes, TPs, corrección | 1 | `FEATURE_EDUCATIVA` (E1, default true) |
| `educativa/anuncios` | Canal de comunicación docente → grupo, notificaciones in-app | 1 | `FEATURE_EDUCATIVA` (E1, default true) |
| `educativa/certificados` | Generación y verificación de certificados QR | 1 | `FEATURE_EDUCATIVA` (E1, default true) |
| `educativa/docentes` | Panel docente, carga de contenido, revisión | 1 | `FEATURE_EDUCATIVA` (E1, default true) |
| `servicios/coworking` | Servicio independiente: reservas públicas, pagos, check-in QR, panel de ingresos propio | 2 | `FEATURE_COWORKING` |
| `servicios/talleres` | Talleres en vivo, inscripción, grabaciones | 2 | `FEATURE_TALLERES` |
| `servicios/tutorias` | Agendado de tutorías presenciales/virtuales | 2 | `FEATURE_TUTORIAS` |
| `comunidad/foro` | Foros por carrera, feed institucional | 3 | `FEATURE_COMUNIDAD` |
| `publica/catalogo` | Landing pública, catálogo abierto, leads | 3 | `FEATURE_PUBLICA` |

---

## 3. Identidad y dominio: incadeducativa.com

### 3.1 Decisión de dominio independiente

La plataforma opera bajo `incadeducativa.com`, completamente independiente del sitio institucional `incade.edu.ar`. Esta decisión es estratégica:

- El sitio institucional es responsabilidad del equipo comercial de INCADE y no bloquea el desarrollo.
- La plataforma tiene identidad propia y puede evolucionar sin dependencias externas.
- Permite escalar a un producto SaaS en el futuro si se decide replicar el modelo.
- Facilita el SEO y posicionamiento como plataforma educativa independiente.

### 3.2 Identidad visual — Design System v2.0

La identidad visual completa vive en `docs/design/DESIGN_SYSTEM_INCADEducativa.md` v2.0. Este spec resume las decisiones de producto; los valores de implementación son los del DS. La paleta fue actualizada en junio 2026 para reflejar el violeta real extraído de `incade.edu.ar`.

**Resumen de tokens clave** (implementación completa en DS §5):

| Token | Valor | Uso |
|---|---|---|
| `--inc-violet` | `#9B30FF` | Color primario de marca — botones, links activos, énfasis |
| `--inc-violet-hover` | `#8520EE` | Hover de elementos primarios |
| `--inc-magenta` | `#C026D3` | Acento secundario — gradientes, badges destacados |
| `--inc-gradient` | `linear-gradient(135deg, #9B30FF, #C026D3)` | Firma visual del ecosistema — heroes, barras de progreso |
| `--edu-bg` | `#08080F` | Fondo base de la aplicación |
| `--edu-surface` | `#100F1E` | Cards, paneles, sidebar |
| `--edu-surface-alt` | `#151428` | Superficies elevadas, hero sections |
| `--edu-surface-raised` | `#1C1A35` | Modales, dropdowns, tooltips |
| `--edu-text-muted` | `rgba(255,255,255,0.55)` | Labels, descripciones, subtítulos |
| `--edu-gold` | `#E8C97A` | Exclusivo para certificados y logros máximos |

**Tipografía:** Inter (Google Fonts). Body 14px / line-height 1.65.
**Íconos:** Lucide React exclusivamente.
**Referencia visual:** `docs/mockups/INCADEducativa_Mockup_v4.html` — 13 pantallas navegables (DS v2.0).

> El mockup v3 (`docs/mockups/archive/`) está obsoleto — no usar como referencia de implementación.

### 3.3 Posición en el ecosistema digital INCADE

INCADEducativa es el **hub central** del ecosistema digital INCADE. Los demás sistemas son módulos o servicios que orbitan la plataforma educativa:

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

**Puntos de contacto mínimos compartidos con el ecosistema** (DS §6):

| Elemento | Valor | Por qué |
|---|---|---|
| Violeta de marca | `#9B30FF` (`--inc-violet`) | Color que el usuario asocia con INCADE |
| Familia tipográfica | Inter | Coherencia de lectura y personalidad de marca |
| Logo mark "IN" | Recuadro `--inc-violet`, mismo estilo | Reconocimiento de ecosistema |
| Modo de color | Dark en INCADEducativa / Light en INCAJOB | Diferenciación funcional deliberada |

**Regla ADR-11:** INCADEducativa no hereda layout, componentes ni paleta de INCAJOB (light mode, violeta `#5B2A86`). Solo los 4 puntos de contacto mínimos definidos arriba.

---

## 4. Roles y perfiles del sistema

El sistema define 6 perfiles con permisos y vistas específicas implementados mediante **Row-Level Security (RLS)** en Supabase. El rol vive en `public.users.role` (enum `user_role`).

| Perfil | Cómo ingresa | Qué puede hacer | Puede convertirse en | Etapa |
|---|---|---|---|---|
| **Administrador** | Creado manualmente por el equipo INCADE | Control total: sedes, usuarios, contenido, coworking, reportes, curación de contenido docente, feature flags | — (rol terminal) | 1, 2 y 3 |
| **Docente / Instructor** | Creado por Admin + permisos habilitados granularmente | Diseña programas, sube contenido, gestiona tutorías. Todo pasa por revisión del Admin antes de publicarse. **NUNCA publica directamente.** | — | 1 y 2 |
| **Alumno INCADE** | Importado por Admin con DNI + carrera, o convertido por Admin desde `comunidad`/`lead`. Activa cuenta por email. | Plataforma educativa completa, coworking con descuento, tutorías, certificados, puntos | Docente (vía `can_teach`, rol dual) | 1 y 2 |
| **Coordinador de Cursos** | Creado por Admin | Reservas en lote de espacios físicos, carga de materiales en cursos asignados si Admin lo habilitó | — | 1 y 2 |
| **Usuario Comunidad** | Registro libre por email, o pago de un curso (desde `lead`) | Compra cursos y talleres online (catálogo educativo abierto en E3). Reserva Coworking a precio público desde E2. Sin descuento institucional. | Alumno INCADE (solo por Admin, tras matrícula presencial) | 2 (coworking) y 3 (educativa) |
| **Lead / Visitante** | Registro libre para acceder a un taller gratuito | Accede al taller gratuito, queda en la base de marketing | Usuario Comunidad (al pagar un curso, E3) · Alumno INCADE (por Admin) | 3 |

> **Importante:** Los Alumnos INCADE se importan masivamente al iniciar el proyecto (CSV con DNI + carrera). No se auto-registran. El sistema les envía un email de activación de cuenta. El Admin importa la base y el alumno solo activa su cuenta existente.

> **Carreras exclusivas de Alumno INCADE (ADR-15):** las carreras completas con certificación INCADE solo pueden cursarse con rol `alumno`. Un `comunidad` o `lead` ve la carrera como vitrina (descripción, materias, salida laboral) pero el CTA no es "Comprar" sino "Inscribite en el Instituto" → admisiones presenciales. Ningún flujo automático (pago, webhook, nurturing) asigna una carrera; solo el Admin la asigna al convertir a `alumno`, como reflejo de una matrícula presencial real.

> **Rol dual Docente (ADR-16):** un `alumno` (típicamente egresado o profesional) puede recibir del Admin el permiso `can_teach` y ser asignado como docente de cursos puntuales. Los permisos docentes son **granulares por curso** (`courses.docente_id` + `can_teach`), no un rol global: el usuario es docente en los cursos asignados y alumno en el resto, con un solo login.

> **Conversión de roles:** toda transición entre perfiles es **aditiva** (nunca elimina historial: cursos, certificados, puntos y pagos se preservan), respeta **un email = un perfil** (no se crean cuentas duplicadas), queda registrada en `users.role_history` y dispara una notificación in-app + email al usuario. Ver §5.2 (CU-T01 a CU-T06) y §11.1.

> **Acceso al Coworking (Etapa 2):** el módulo Coworking es un servicio independiente. Con `FEATURE_COWORKING=true`, cualquier usuario con registro mínimo (nombre + email + contraseña) puede reservar a precio público — independientemente de `FEATURE_PUBLICA` (que solo gobierna el catálogo educativo abierto en E3). Los alumnos INCADE, docentes y coordinadores reciben descuento institucional automático por rol. Ver §6 y ADR-13.

---

## 5. Casos de uso del MVP educativo (Etapa 1)

### ROL: ADMINISTRADOR

- [ ] CRUD completo de usuarios: importar CSV de alumnos con DNI y carrera, crear docentes, asignar roles
- [ ] Importar base inicial de alumnos y docentes con email de activación automático
- [ ] Gestionar catálogo: crear carreras, cursos, módulos y clases
- [ ] Revisar y aprobar o rechazar contenido enviado por docentes (cola de curación)
- [ ] Publicar cursos, carreras y programas
- [ ] Ver dashboard con métricas académicas: alumnos activos, progreso, completions, certificados
- [ ] Exportar reportes en PDF y Excel
- [ ] Habilitar y deshabilitar permisos granulares a cada docente
- [ ] Gestionar feature flags para activar módulos de servicio
- [ ] Acceder al log de auditoría completo del sistema
- [ ] Configurar sistema de puntos: reglas, beneficios y canjes

### ROL: DOCENTE / INSTRUCTOR

- [ ] Diseñar la estructura del programa: módulos, clases, orden y tipo de contenido
- [ ] Subir videos, materiales descargables, textos y recursos a sus cursos asignados
- [ ] Armar evaluaciones con el editor visual: cuestionarios de módulo, exámenes finales y entregas de TP (5 tipos de pregunta) *(ver Addendum 01)*
- [ ] Corregir manualmente preguntas abiertas, fundamentaciones de V/F y entregas de TP, con devolución por alumno
- [ ] Ver panel de resultados por evaluación: notas, promedio del grupo, distribución, export CSV
- [ ] Enviar anuncios al grupo del curso (in-app + email) desde su panel *(ver Addendum 02)*
- [ ] Enviar contenido a revisión del Admin (estado: `EN REVISIÓN`)
- [ ] Recibir feedback del Admin sobre contenido rechazado con comentarios
- [ ] Planificar tutorías virtuales (Meet/Zoom) y presenciales en sede *(Etapa 2 — FEATURE_TUTORIAS)*
- [ ] Ver progreso y asistencia de sus alumnos
- [ ] Registrar asistencia a tutorías en vivo *(Etapa 2 — FEATURE_TUTORIAS)*
- [ ] Ver reportes básicos de engagement: videos completados, tiempo en plataforma
- [ ] ❌ **NUNCA puede publicar directamente — todo pasa por Admin**

### ROL: ALUMNO INCADE

- [ ] Activar cuenta con email institucional (cargado previamente con DNI y carrera)
- [ ] Acceder al dashboard personal: cursos activos, progreso, próximas clases, puntos
- [ ] Ver y navegar el catálogo de cursos y carreras disponibles
- [ ] Inscribirse a cursos gratuitos (dentro de su carrera) — en E1 solo cursos gratuitos; *cursos de pago: Etapa 3 (apertura pública)*
- [ ] Completar clases: videos, materiales, textos
- [ ] Rendir cuestionarios de módulo y exámenes finales (V/F con fundamentación, opción única/múltiple, pregunta abierta)
- [ ] Entregar trabajos prácticos: upload de archivo, link de Drive/GitHub, URL externa o texto en plataforma *(ver Addendum 01)*
- [ ] Recibir notificación in-app + email cuando el docente corrige su TP o pregunta abierta
- [ ] Recibir anuncios del docente del curso (campana de notificaciones + email)
- [ ] Configurar preferencias de notificación por canal (in-app/email/WhatsApp)
- [ ] Ver su progreso por módulo y por carrera en tiempo real
- [ ] Descargar certificados digitales con QR de verificación al aprobar
- [ ] Acumular puntos por completar módulos, aprobar exámenes, asistir a talleres
- [ ] Canjear puntos por beneficios: horas de coworking, descuentos, acceso a contenido premium
- [ ] Acceder al módulo de coworking con descuento institucional automático *(Etapa 2)*

---

### 5.1 Casos de uso detallados — flujos críticos

#### CU-01: Alumno completa una clase

| Campo | Detalle |
|---|---|
| **Actor** | Alumno INCADE autenticado |
| **Precondición** | Alumno inscripto en el curso. Clase en estado `PUBLICADA`. |
| **Trigger** | Alumno abre la clase desde su dashboard o panel del curso. |
| **Flujo principal** | 1. Accede al curso → 2. Selecciona clase → 3. Visualiza contenido (video/texto) → 4. Sistema registra progreso en tiempo real → 5. Al completar el 100%, marca clase como `COMPLETADA` → 6. Si era la última del módulo, desbloquea la evaluación del módulo (estado `DISPONIBLE`) → 7. Si era la última del curso, habilita el examen final |
| **Alternativas** | A1: Abandona a mitad del video → el sistema guarda el punto de progreso para retomar. A2: Falla la conexión → el progreso guardado se sincroniza al reconectar. |
| **Postcondición** | Clase marcada `COMPLETADA`. Progreso del módulo actualizado. Puntos acumulados si corresponde. |
| **Criterio de éxito** | El progreso se persiste correctamente. La barra de progreso se actualiza sin recargar la página. |

#### CU-02: Docente sube contenido y lo envía a revisión

| Campo | Detalle |
|---|---|
| **Actor** | Docente con permisos habilitados por Admin |
| **Precondición** | Admin creó el curso y lo asignó al docente. Permisos de carga habilitados. |
| **Trigger** | Docente accede al editor de su curso desde su panel. |
| **Flujo principal** | 1. Abre el editor del curso asignado → 2. Crea módulos y clases → 3. Sube videos/materiales → 4. Completa metadatos (descripción, duración estimada) → 5. Marca el curso como listo → 6. Sistema cambia estado a `EN REVISIÓN` → 7. Admin recibe notificación → 8. Admin aprueba o rechaza con feedback |
| **Alternativas** | A1: Admin rechaza → Docente recibe notificación con comentarios → Puede editar y reenviar. A2: Video muy grande → Sistema muestra límite y sugiere compresión. |
| **Postcondición** | Si aprobado: curso en estado `PUBLICADO` y visible para alumnos. Si rechazado: curso en `BORRADOR` con comentarios del Admin. |
| **Criterio de éxito** | El ciclo de revisión no supera 2 acciones (subir → revisar). El Admin puede aprobar desde el dashboard sin entrar al editor. |

#### CU-03: Alumno obtiene certificado

| Campo | Detalle |
|---|---|
| **Actor** | Alumno INCADE |
| **Precondición** | Alumno completó todas las clases y aprobó el examen final del curso (nota ≥ 60%). |
| **Trigger** | Sistema detecta que el alumno cumplió todos los criterios de aprobación. |
| **Flujo principal** | 1. Sistema genera certificado en PDF con QR único → 2. Notifica al alumno por email y en la plataforma → 3. Alumno accede a su sección de Certificados → 4. Descarga el PDF → 5. Comparte el enlace público de verificación con su QR |
| **Alternativas** | A1: Alumno reprueba el examen → puede reintentar pasadas 24hs. A2: Alumno solicita corrección de nombre → Admin puede editar y regenerar. |
| **Postcondición** | Certificado en estado `EMITIDO`. Enlace público de verificación activo permanentemente. Puntos de certificación acreditados. |
| **Criterio de éxito** | El certificado se genera en menos de 10 segundos. El QR de verificación funciona offline (URL pública sin login). |

#### CU-04: Docente arma una evaluación y corrige entregas

| Campo | Detalle |
|---|---|
| **Actor** | Docente con permisos habilitados por Admin (o Admin directo) |
| **Precondición** | Curso asignado al docente. Módulo o curso existente para asociar la evaluación. |
| **Trigger** | Docente entra a su curso → sección "Evaluaciones" → "+ Agregar pregunta". |
| **Flujo principal** | 1. Elige tipo de evaluación (cuestionario de módulo / examen final / entrega de TP) → 2. Agrega preguntas desde un menú visual con íconos (V/F con fundamentación, opción única, opción múltiple, abierta, entrega TP) → 3. Configura opciones, respuesta correcta y peso → 4. Reordena con drag & drop → 5. Configura parámetros globales (tiempo límite, nota mínima 60%, intentos, espera entre intentos 24hs, resultado inmediato o diferido) → 6. Guarda como `BORRADOR` o envía a revisión junto al contenido → 7. Para preguntas abiertas/fundamentación/TP: cuando los alumnos entregan, el docente ve un badge de "correcciones pendientes" → 8. Carga nota parcial y devolución por alumno → 9. El sistema integra score automático + manual y notifica al alumno |
| **Alternativas** | A1: El Admin usa el mismo editor sin pasar por revisión. A2: Evaluación todo-automática (sin preguntas abiertas/TP) → no genera cola de corrección. A3: Alumno desaprueba → puede reintentar según configuración de intentos y espera. |
| **Postcondición** | Evaluación asociada al módulo/curso. Notas calculadas combinando parte automática + manual. Estados del alumno actualizados (`APROBADA`/`DESAPROBADA`/`CORREGIDA`). |
| **Criterio de éxito** | El docente arma una pregunta en menos de 3 clics. La corrección manual actualiza la nota total en tiempo real. *(ver Addendum 01)* |

#### CU-05: Docente envía un anuncio al grupo

| Campo | Detalle |
|---|---|
| **Actor** | Docente (o Admin/Coordinador del curso) |
| **Precondición** | Curso con alumnos inscriptos. |
| **Trigger** | Docente entra a su panel del curso → sección "Anuncios" → "+ Nuevo anuncio". |
| **Flujo principal** | 1. Escribe el mensaje en editor de texto enriquecido → 2. Opcionalmente adjunta archivo o link → 3. Selecciona destinatario (todos los inscriptos por defecto) → 4. Confirma el envío → 5. El sistema dispara simultáneamente notificación in-app (Supabase Realtime) + email → 6. El anuncio queda publicado en la sección Anuncios del curso en orden cronológico inverso |
| **Alternativas** | A1: Admin envía comunicado institucional a múltiples cursos/carreras desde Panel Admin → Comunicaciones. A2: Alumno ajusta preferencias y desactiva email para anuncios (in-app nunca se desactiva). |
| **Postcondición** | Registro en `announcements`. Notificaciones `ANNOUNCEMENT` generadas para cada alumno. |
| **Criterio de éxito** | La notificación in-app aparece en menos de 5 segundos. El email llega en menos de 60 segundos. El docente envía en menos de 3 clics. *(ver Addendum 02)* |

#### CU-06: Reserva pública de Coworking (usuario externo) — Etapa 2

| Campo | Detalle |
|---|---|
| **Actor** | Usuario Comunidad / Lead / visitante registrado |
| **Precondición** | `FEATURE_COWORKING=true`. Espacio con disponibilidad. |
| **Trigger** | El visitante entra a la sección Coworking de `incadeducativa.com` (visible sin login). |
| **Flujo principal** | 1. Explora espacios: fotos, capacidad, servicios y precio → 2. Selecciona sede, fecha y horario en el calendario en tiempo real → 3. Ve resumen con precio total → 4. Si no está logueado, el sistema solicita registro mínimo (nombre + email + contraseña) → 5. Paga vía MercadoPago → 6. El webhook MP confirma el pago → reserva pasa a `CONFIRMADA` → 7. El sistema genera QR de acceso + envía confirmación por email + WhatsApp |
| **Alternativas** | A1: Alumno INCADE/docente/coordinador logueado → precios ya mostrados con descuento institucional automático por rol (precio original tachado). A2: Admin crea reserva manual sin pago online (acuerdo directo). A3: No-show → cron marca `NO_SHOW` a los 15 min sin check-in. |
| **Postcondición** | Reserva `CONFIRMADA` con `tipo_descuento` (`publico`/`institucional`/`manual`). Ingreso registrado en el panel de ingresos del Coworking (separado del educativo). |
| **Criterio de éxito** | El usuario externo reserva en menos de 5 pasos. La confirmación post-webhook ocurre en menos de 3 segundos. Cero doble asignación de espacio. *(ver Addendum 03)* |

---

### 5.2 Casos de uso de transición — conversión de roles

> Cubren qué ocurre cuando un usuario cambia de contexto (se matricula, paga, el Admin lo convierte). Todos respetan las reglas de §4: conversión aditiva, un email = un perfil, registro en `role_history`, notificación in-app + email. *(ver Addendum 04)*

| CU | Escenario | Etapa | Disparador | Rol resultante |
|---|---|---|---|---|
| **CU-T01** | Alumno se inscribe a un curso gratuito fuera de su carrera | E1 | Autoservicio (sin pago, sin Admin) | `alumno` (sin cambio) — el curso queda como "adicional" fuera del mapa de carrera |
| **CU-T02** | Comunidad/Lead intenta acceder a una carrera | E1 | Visita la página de la carrera | Sin cambio — CTA a admisiones presenciales, no a compra (ADR-15) |
| **CU-T03** | Lead paga su primer curso | E3 | Webhook MP `payment.approved` | `comunidad` (automático, sin Admin) |
| **CU-T04** | Comunidad se matricula presencialmente | E1 (manual Admin) | Admin convierte el perfil (asigna DNI + carrera) | `alumno` |
| **CU-T05** | Lead se matricula sin haber pagado curso | E1 (manual Admin) | Admin convierte el perfil directamente | `alumno` (saltea `comunidad`) |
| **CU-T06** | Admin habilita a un alumno como docente | E1 | Admin activa `can_teach` + asigna curso | `alumno` + permisos docentes por curso (rol dual) |

#### CU-T04: Comunidad/Lead → Alumno INCADE (conversión por Admin)

| Campo | Detalle |
|---|---|
| **Actor** | Admin + usuario existente (`comunidad` o `lead`) |
| **Precondición** | El usuario ya tiene cuenta. Completó la admisión presencial en el Instituto. |
| **Flujo principal** | 1. Admin busca el perfil por email/nombre → 2. Abre el perfil → 3. "Convertir a Alumno INCADE" → 4. Confirma DNI + carrera a asignar → 5. Sistema ejecuta `convert_user_role()`: cambia `role` a `alumno`, asigna `carrera_id` y `dni`, agrega entrada a `role_history`, inserta notificación → 6. El usuario recibe aviso in-app + email con sus nuevos accesos |
| **Postcondición** | Rol `alumno`. Historial 100% preservado (la conversión es aditiva: solo suma beneficios). Acceso al mapa de carrera, descuento coworking y tutorías incluidas. |
| **Criterio de éxito** | Cero pérdida de datos. La notificación llega in-app + email. El cambio queda auditado en `role_history` con `by = admin_uuid`. |

#### CU-T06: Alumno → rol dual Docente

| Campo | Detalle |
|---|---|
| **Actor** | Admin |
| **Precondición** | Usuario con rol `alumno`. |
| **Flujo principal** | 1. Admin abre el perfil del alumno → 2. Activa `can_teach = true` → 3. Asigna el curso a dictar (`courses.docente_id = user_id`) → 4. El usuario ve su panel de alumno y, además, el panel docente de los cursos asignados — mismo login |
| **Postcondición** | Rol base `alumno` intacto + permisos docentes granulares por curso. RLS de escritura del curso habilitada vía `can_teach_course()`. |
| **Criterio de éxito** | No se crea una cuenta nueva. El usuario puede ser docente en un curso y alumno en otro simultáneamente. |

---

## 6. Módulo Coworking — servicio independiente

El coworking **no es una aplicación paralela ni un subbeneficio del módulo educativo**. Es un **servicio independiente con fuente de ingreso propia**, abierto a la comunidad general, que convive dentro de `incadeducativa.com` bajo el feature flag `FEATURE_COWORKING` (Etapa 2). Comparte dominio, auth y perfil de usuario con el LMS, pero **no depende del progreso educativo para funcionar**: tiene su propio flujo de acceso, su propia gestión admin y su propio panel de ingresos. *(ver Addendum 03)*

### 6.1 Perfiles de acceso al Coworking

| Perfil | Acceso | Precio | Observación |
|---|---|---|---|
| Alumno INCADE activo | Sí | Con descuento institucional (% configurable) | Descuento automático por rol, sin código |
| Docente / Coordinador | Sí | Con descuento institucional | Mismo nivel que alumno INCADE |
| Usuario Comunidad Online | Sí | Precio público | Mismo flujo que cualquier visitante registrado |
| Lead / Visitante registrado | Sí | Precio público | Puede reservar tras crear cuenta gratuita |
| Usuario sin cuenta | No | — | Requiere registro mínimo (nombre + email + contraseña) |
| Admin | Sí | Sin cargo (gestión interna) | Puede crear reservas manuales sin pago online |

### 6.2 Funcionalidades del módulo

- [ ] Sección Coworking visible en la navegación pública (sin login): espacios, fotos, capacidad, servicios, precios y calendario en tiempo real
- [ ] Reserva pública: cualquier usuario con registro mínimo puede reservar a precio público
- [ ] Descuento institucional automático por rol (alumno/docente/coordinador), sin código
- [ ] Pagos con MercadoPago (tarjeta, transferencia, Mercado Crédito); webhook como única fuente de verdad
- [ ] Check-in QR + check-in manual ("Presente" en la lista del día)
- [ ] Reservas manuales del admin (sin pago online, para acuerdos directos)
- [ ] Notificaciones automáticas: confirmación, recordatorio 24hs, aviso de no-show
- [ ] Gestión de no-shows: cron a los 15 min, penalización configurable
- [ ] Panel admin propio: dashboard de ocupación, gestión de espacios multi-sede, bloqueos
- [ ] **Panel de ingresos independiente del módulo educativo**: ingresos por período, espacio, tipo de usuario (comunidad vs institucional) y sede, con export CSV
- [ ] Membresías y suscripciones mensuales/anuales
- [ ] Reservas en lote: coordinadores pueden reservar un espacio varias semanas seguidas
- [ ] Bloqueo automático de aula al agendar una tutoría presencial (uso institucional, sin flujo de pago)
- [ ] Sistema de puntos integrado: canje de puntos por horas de coworking

### 6.3 Puntos de integración con el módulo educativo

Aunque es independiente, mantiene los siguientes puntos de contacto mínimos:

| Integración | Descripción |
|---|---|
| Auth compartida | Un solo login y un solo perfil para ambos módulos |
| Descuento por rol | El sistema detecta `alumno`/`docente`/`coordinador` activo y aplica el descuento automáticamente |
| Canje de puntos | Los puntos por completar cursos se canjean como crédito para reservas (config del admin) |
| Reserva de aula para tutorías | El docente agenda una tutoría presencial → el Coworking bloquea el aula automáticamente |
| Historial unificado | El perfil muestra historial de cursos y de reservas de Coworking en el mismo lugar |

> Los ingresos del Coworking y los ingresos por cursos/suscripciones se reportan **por separado**. El Coworking es un revenue stream propio (ADR-13).

---

## 7. Módulos futuros — arquitectura extensible

La arquitectura de módulos con feature flags permite agregar nuevos servicios sin modificar el núcleo de la plataforma.

| Módulo futuro | Feature flag | Descripción |
|---|---|---|
| Bolsa de trabajo | `FEATURE_EMPLEOS` | Ofertas laborales para egresados y alumnos INCADE |
| Mentoría 1:1 | `FEATURE_MENTORIA` | Agendado de sesiones con mentores de la red INCADE |
| Eventos presenciales | `FEATURE_EVENTOS` | Venta de entradas y gestión de asistencia a eventos |
| Biblioteca digital | `FEATURE_BIBLIOTECA` | Repositorio de materiales, papers y recursos para alumnos |
| Certificaciones externas | `FEATURE_CERT_EXT` | Integración con plataformas de certificación reconocidas |
| App móvil nativa | N/A | Versión iOS/Android de la PWA para mayor engagement |

---

## 8. Plan de desarrollo por etapas

### 8.1 Etapa 1 — MVP Educativo (semanas 1–10)

| Semana | Sprint | Entregables clave |
|---|---|---|
| 1–2 | Setup y estructura base | App única Next.js 14, Supabase configurado, Auth básica, estructura de módulos, `CLAUDE.md`, CI/CD en Vercel, dominio `incadeducativa.com` configurado |
| 3–4 | Auth + onboarding + roles | Login/registro, importación CSV alumnos, activación de cuenta por email, sistema de roles RLS, panel de Admin básico |
| 5–6 | Plataforma educativa core | Catálogo de cursos, estructura módulo/clase, player de video/contenido, registro de progreso en tiempo real |
| 7–8 | Panel docente + revisión | Editor de cursos, carga de contenido, flujo de revisión Admin→Docente, notificaciones por email |
| 9–10 | Certificados + puntos + QA | Generación de PDF con QR, sistema de puntos, exámenes finales, cuestionarios, testing E2E con Playwright, correcciones |

### 8.2 Etapa 2 — Módulo Coworking (semanas 11–20)

| Semana | Sprint | Entregables clave |
|---|---|---|
| 11–12 | Arquitectura del módulo | Feature flag `FEATURE_COWORKING`, schema DB coworking, integración con auth existente, UI base del módulo |
| 13–14 | Reservas + calendario | Calendario de disponibilidad, flujo de reserva, integración MercadoPago, comprobante QR |
| 15–16 | Panel admin coworking | Dashboard de ocupación, gestión de espacios multi-sede, reportes básicos |
| 17–18 | Membresías + notificaciones | Suscripciones mensuales/anuales, notificaciones WhatsApp/email, sistema de no-show |
| 19–20 | Integración + QA completo | Descuento automático para alumnos, canje de puntos por horas, testing E2E, correcciones |

### 8.3 Etapa 3 — Apertura pública (semanas 21+)

- Catálogo público sin login: visitantes pueden ver cursos disponibles
- Registro libre de usuarios externos con suscripción mensual o compra individual
- Landing pública en `incadeducativa.com` orientada a conversión y captación de leads
- Integración con herramientas de email marketing para nurturing de leads
- Módulo de comunidad: foros por carrera, feed institucional, red de egresados
- Analítica avanzada: funnel de conversión visitante → lead → alumno → egresado

> **Hito Etapa 1:** 100 alumnos INCADE activos en la plataforma en los primeros 30 días post-lanzamiento.  
> **Hito Etapa 2:** 30% de los alumnos activos utilizan el módulo coworking en los primeros 60 días.

---

## 9. Stack tecnológico justificado

| Capa | Tecnología | Versión | Justificación |
|---|---|---|---|
| Frontend / PWA | Next.js + TypeScript | 14 / App Router | SSR, PWA nativa, layouts anidados por módulo, feature flags nativos |
| UI Components | shadcn/ui tematizado con Design System v2.0 · Lucide React · Inter | Latest | Componentes accesibles y personalizables, dark mode via CSS variables del DS |
| Backend / API | Next.js API Routes + tRPC | 14 | Tipado end-to-end, sin contratos rotos entre front y back |
| Base de datos | Supabase (PostgreSQL) | Latest | RLS nativo para roles, auth integrada, realtime, storage |
| Auth | Supabase Auth | Built-in | Email magic link, JWT, compatible con RLS policies |
| Pagos | MercadoPago SDK | v2 | Solución regional LATAM, métodos de pago locales argentinos |
| Video / Contenido | Supabase Storage + HLS | — | Videos alojados propios, reproducción adaptativa |
| PDF / Certificados | Puppeteer o React-PDF | Latest | Generación server-side de certificados con QR |
| QR Codes | `qrcode` npm | Latest | Generación de QR para certificados y reservas coworking |
| Email | Resend | Latest | Alta entregabilidad LATAM, templates React |
| Notif. WhatsApp | Twilio WhatsApp API | — | Canal preferido en Argentina para recordatorios |
| IA | Claude API (Anthropic) | claude-sonnet-4 | Tutor IA, resúmenes de clases, asistente admin |
| DevOps | Vercel + GitHub Actions | — | CI/CD automático, preview por PR, deploy en segundos |
| Testing | Playwright + Vitest | Latest | E2E para flujos críticos, unit para lógica de negocio |
| Monitoreo | Sentry + Vercel Analytics | — | Errores en producción + performance real |
| IDE / Dev | Cursor + Claude CLI | Latest | SDD, desarrollo asistido por IA, `CLAUDE.md` como fuente de verdad |

---

## 10. Schema de base de datos

### 10.1 Entidades principales — Etapa 1 (educativa)

| Tabla | Campos clave | Notas |
|---|---|---|
| `users` | `id, email, role, dni, nombre, carrera_id, puntos, can_teach, role_history (jsonb), created_at` | RLS: cada usuario solo ve su propio perfil. `role` enum `user_role` (admin/docente/alumno/coordinador/comunidad/**lead**). `can_teach` habilita rol dual docente por curso. `role_history` audita cada conversión *(Addendum 04)* |
| `careers` | `id, nombre, descripcion, activa, created_at` | Una carrera agrupa múltiples cursos |
| `courses` | `id, titulo, descripcion, carrera_id, docente_id, estado, precio, created_at` | `estado`: borrador / revision / publicado |
| `modules` | `id, course_id, titulo, orden, created_at` | `orden` define la secuencia del curso |
| `lessons` | `id, module_id, titulo, tipo, contenido_url, duracion_min, orden` | `tipo`: video / texto / documento |
| `enrollments` | `id, user_id, course_id, estado, progreso_pct, fecha_inscripcion, fecha_completado` | `progreso_pct` se recalcula automáticamente |
| `lesson_progress` | `id, user_id, lesson_id, completada, tiempo_visto_seg, updated_at` | Granularidad por clase para reanudar |
| `evaluations` | `id, lesson_id, module_id, course_id, titulo, tipo, preguntas (jsonb), config (jsonb), nota_minima` | Antes `quizzes`. `tipo`: cuestionario_modulo / examen_final / tp. `config`: tiempo límite, intentos, espera, resultado inmediato/diferido *(Addendum 01)* |
| `evaluation_attempts` | `id, user_id, evaluation_id, respuestas (jsonb), estado, score_auto, score_manual, nota, intento_num, created_at` | Antes `quiz_attempts`. `estado`: 7 estados del flujo (bloqueada → corregida) |
| `evaluation_submissions` | `id, evaluation_id, user_id, tipo_entrega, submission_url, file_url, texto, estado, created_at` | Entregas de TP: archivo / Drive / GitHub / URL / texto |
| `manual_corrections` | `id, attempt_id, nota_parcial, comentario, corregido_por, created_at` | Corrección manual de preguntas abiertas, fundamentaciones y TPs |
| `notifications` | `id, user_id, tipo, course_id, sender_id, referencia_id, titulo, cuerpo, canal, leida, created_at` | Backbone de comunicación: anuncios, correcciones, sistema *(Addendum 02, ADR-14)* |
| `announcements` | `id, course_id, sender_id, titulo, body, attachment_url, created_at` | Anuncios del docente/admin al grupo del curso |
| `announcement_reads` | `announcement_id, user_id, read_at` | Marca de lectura por alumno (PK compuesta) |
| `certificates` | `id, user_id, course_id, uuid_verificacion, pdf_url, emitido_at` | `uuid_verificacion` es la clave del QR público |
| `points_log` | `id, user_id, puntos, motivo, referencia_id, created_at` | Log inmutable de todos los movimientos de puntos |
| `content_reviews` | `id, course_id, docente_id, admin_id, estado, comentario, created_at` | Flujo de aprobación de contenido |

**Funciones de conversión de rol** *(Addendum 04, migración 004)*:
- `convert_user_role(p_user_id, p_new_role, p_carrera_id?, p_dni?)` — `security definer`, solo Admin. Cambia el rol de forma aditiva, asigna carrera/DNI solo si el destino es `alumno`, agrega entrada a `role_history` (`from`/`to`/`at`/`by`) e inserta notificación de sistema. Es la **única** vía de asignación de carrera.
- `can_teach_course(p_course_id)` — `security definer`. `true` si el usuario autenticado tiene `can_teach = true` y es `docente_id` del curso. Usada en las policies de escritura para habilitar el rol dual.

### 10.2 Entidades principales — Etapa 2 (coworking)

| Tabla | Campos clave | Notas |
|---|---|---|
| `locations` | `id, nombre, direccion, activa` | Dos sedes iniciales de INCADE en Posadas |
| `spaces` | `id, location_id, nombre, tipo, capacidad, precio_hora, activo` | `tipo`: hot_desk / sala_reunion / aula |
| `bookings` | `id, user_id, space_id, fecha_inicio, fecha_fin, estado, monto, descuento_pct, tipo_descuento` | `estado`: pendiente / confirmada / en_uso / completada / cancelada / no_show. `tipo_descuento`: institucional / publico / manual |
| `payments` | `id, booking_id, mp_preference_id, mp_payment_id, monto, estado, created_at` | Referencia a MercadoPago para trazabilidad |
| `memberships` | `id, user_id, tipo, inicio, fin, creditos_restantes, activa` | Planes mensuales y anuales |
| `checkins` | `id, booking_id, timestamp, metodo` | `metodo`: qr / manual. Log de check-ins para reportes |

---

## 11. Flujos críticos del sistema

### 11.1 Activación de cuenta de alumno

```
Admin importa CSV
  → Sistema crea usuarios en estado PENDIENTE
  → Envía email con link de activación (magic link)
  → Alumno hace clic
  → Elige contraseña
  → Completa perfil
  → Accede al dashboard
  → Ve sus cursos asignados
```

**Rama: migración de rol sobre perfil existente** *(Addendum 04)*

Cuando un usuario ya tiene cuenta (`comunidad` o `lead`) y se matricula presencialmente, el Admin NO crea una cuenta nueva — convierte el perfil existente (un email = un perfil):

```
Usuario ya existe (comunidad/lead, cuenta activa)
  → Se matricula presencialmente en el Instituto
  → Admin busca el perfil por email/nombre
  → "Convertir a Alumno INCADE" (ingresa DNI + carrera)
  → Sistema ejecuta convert_user_role()
      · role → alumno · asigna carrera_id + dni
      · agrega entrada a role_history (from/to/at/by)
      · inserta notificación de sistema
  → Usuario recibe aviso in-app + email
  → Conserva todo su historial (cursos, certificados, puntos, pagos)
  → Gana acceso al mapa de carrera, descuento coworking y tutorías
```

### 11.2 Publicación de curso (ciclo Admin ↔ Docente)

```
Admin crea curso vacío y lo asigna al docente
  → Docente carga contenido (módulos, clases, videos, materiales)
  → Docente envía a revisión  →  estado: EN REVISIÓN
  → Sistema notifica al Admin
  → Admin revisa desde su panel
      ├── Aprueba  →  estado: PUBLICADO  →  Alumnos pueden ver el curso
      └── Rechaza con comentario
            → Docente corrige y reenvía
            → Admin aprueba  →  estado: PUBLICADO
```

### 11.3 Pago con MercadoPago (coworking, Etapa 2)

```
Usuario selecciona espacio y horario
  → Sistema verifica disponibilidad
  → Crea preference en MercadoPago API
  → Redirige al checkout MP
  → Usuario paga
  → MP notifica vía webhook al sistema
  → Sistema confirma reserva
  → Genera QR de check-in
  → Envía email + WhatsApp de confirmación
```

### 11.4 Verificación de certificado (público, sin login)

```
Empleador o tercero escanea el QR del certificado
  → Accede a URL pública: incadeducativa.com/verificar/[uuid]
  → Sin login requerido
  → Sistema muestra:
      - Nombre del alumno
      - Curso completado
      - Fecha de emisión
      - Validez del certificado
  → La URL es permanente e indefinida
```

---

## 12. Criterios de aceptación por módulo

| Módulo | Criterio de aceptación |
|---|---|
| **Auth + Onboarding** | El flujo de activación se completa en menos de 3 pasos. El CSV de importación procesa 500 registros en menos de 30 segundos. |
| **Catálogo de cursos** | Un alumno puede descubrir, inscribirse y comenzar una clase en menos de 3 clics desde su dashboard. |
| **Player de contenido** | El progreso se guarda automáticamente cada 10 segundos. Si el alumno abandona y vuelve, retoma desde donde dejó. |
| **Motor de Evaluaciones** | El docente arma una pregunta en menos de 3 clics desde el editor visual. El resultado automático se muestra en tiempo real sin recargar. La corrección manual integra score auto + manual al instante y notifica al alumno. El alumno puede reintentar pasadas 24hs de un intento fallido. |
| **Entregas de TP** | El alumno entrega por archivo, Drive, GitHub, URL o texto según configure el docente. El docente accede a todas las entregas del grupo ordenadas por alumno. |
| **Comunicación docente → grupo** | La notificación in-app aparece en menos de 5 segundos (Realtime). El email llega en menos de 60 segundos. El docente envía un anuncio en menos de 3 clics. |
| **Certificados** | El certificado se genera en menos de 10 segundos tras aprobar. El QR de verificación funciona en URL pública sin login. |
| **Sistema de puntos** | Los puntos se acreditan automáticamente. El historial de movimientos es visible para el alumno en todo momento. |
| **Panel Admin** | El Admin puede aprobar o rechazar contenido docente sin entrar al editor del curso. El dashboard carga en menos de 2 segundos. |
| **Conversión de roles** | Toda conversión preserva el 100% del historial (cursos, certificados, puntos, pagos). Cada cambio queda registrado en `role_history` con autor y timestamp, y dispara notificación in-app + email. Las carreras solo se asignan al convertir a `alumno` por el Admin (ningún flujo automático). |
| **Módulo Coworking (E2)** | Un usuario externo reserva desde cero en menos de 5 pasos. El descuento institucional se aplica sin código. Cero errores de doble asignación de espacio. Confirmación de reserva en menos de 3 segundos post-pago. El panel de ingresos del período mensual carga en menos de 2 segundos. |

---

## 13. Decisiones de arquitectura (ADRs)

| ADR | Decisión | Justificación |
|---|---|---|
| **ADR-01** | Dominio independiente: `incadeducativa.com` | La plataforma no depende del sitio institucional `incade.edu.ar`. Permite evolucionar el producto sin bloqueos externos. |
| **ADR-02** | Plataforma educativa como núcleo, coworking como módulo | Invierte la prioridad del spec anterior. Refleja el replanteo acordado con el cliente en junio 2026. |
| **ADR-03** | Feature flags para módulos de servicio | Permite activar/desactivar servicios sin deploys. Facilita el testeo gradual y reduce el riesgo de lanzamiento. |
| **ADR-04** | Supabase como backend completo | Auth + DB + Storage + Realtime en una sola plataforma. Reduce la complejidad de infraestructura para un equipo pequeño. |
| **ADR-05** | Importación masiva de alumnos, no auto-registro | Los alumnos INCADE ya existen físicamente. El Admin los importa y el sistema los activa. Garantiza la integridad de la base de datos inicial. |
| **ADR-06** | Contenido docente siempre pasa por revisión del Admin | INCADE necesita control editorial. Ningún docente puede publicar directamente. El flujo garantiza la calidad del contenido. |
| **ADR-07** | Certificados con QR de verificación pública sin login | El certificado tiene valor fuera de la plataforma. El empleador no necesita una cuenta para verificarlo. |
| **ADR-08** | Reservado | Número reservado para mantener la continuidad histórica de la numeración de ADRs. |
| **ADR-09** | Design System v2.0 como fuente de verdad visual | Los tokens `--inc-*` y `--edu-*` son la única fuente de colores. shadcn se tematiza vía CSS variables (ver SHADCN_THEME.md). Ningún hex hardcodeado en componentes. |
| **ADR-10** | Lucide React como librería de íconos | Consistencia con shadcn, peso bundle controlado, API uniforme. Prohibido mezclar con Tabler u otros sin aprobación. |
| **ADR-11** | INCADEducativa no hereda identidad de INCAJOB | INCAJOB es light mode con violeta corporativo `#5B2A86`. INCADEducativa hereda de incade.edu.ar directamente. Solo 4 puntos de contacto mínimos compartidos (DS §6). |
| **ADR-12** | Motor de Evaluaciones unificado bajo entidad `evaluation` | Cuestionarios, exámenes y TPs comparten la misma tabla `evaluations` con un campo `tipo`. Evita 3 modelos paralelos. Las preguntas se almacenan como `jsonb` para flexibilidad de tipos. Reemplaza el naming `quizzes`/`quiz_attempts` *(Addendum 01)*. |
| **ADR-13** | Coworking como revenue stream independiente | El Coworking no es un subbeneficio del módulo educativo: tiene acceso público desde E2, panel de ingresos propio y reporte financiero separado. `FEATURE_COWORKING` habilita reservas a cualquier usuario registrado, independiente de `FEATURE_PUBLICA` *(Addendum 03)*. |
| **ADR-14** | Tabla `notifications` única como backbone de comunicación | Anuncios docentes, correcciones de TP y eventos de sistema se modelan en una sola tabla `notifications` con campo `tipo` y `canal`. Supabase Realtime entrega el badge in-app. Define la tabla que la Spec referenciaba sin especificar *(Addendum 02)*. |
| **ADR-15** | Carreras exclusivas para `alumno`, no comprables online | Las carreras son el activo institucional más valioso de INCADE; su validez depende del proceso de admisión presencial. La plataforma las muestra como vitrina, pero deriva a admisiones (la conversión a `alumno` y la asignación de carrera las hace solo el Admin). La plataforma actúa como canal de captación para el Instituto *(Addendum 04)*. |
| **ADR-16** | Conversiones de rol aditivas + `role_history` + rol dual `can_teach` | Las transiciones nunca borran historial (solo suman beneficios); un email = un perfil. Cada cambio se audita en `role_history`. El rol docente para alumnos es un permiso granular por curso (`can_teach` + `courses.docente_id` vía `can_teach_course()`), no un rol global, evitando duplicar cuentas *(Addendum 04)*. |

---

## 14. Convenciones Cursor + Claude CLI

### 14.1 Estructura del CLAUDE.md

El repositorio debe contener un `CLAUDE.md` en la raíz que referencie este documento como fuente de verdad. Contenido mínimo:

```markdown
# CLAUDE.md — INCADEducativa

## Fuente de verdad
Este proyecto sigue el spec: INCADEducativa_Spec_v3.md
Design System: docs/design/DESIGN_SYSTEM_INCADEducativa.md v2.0

## Stack
Next.js 14 · Supabase · MercadoPago · Vercel · TypeScript

## Módulos activos
- core/auth          → siempre activo
- educativa/cursos   → FEATURE_EDUCATIVA=true
- educativa/carreras → FEATURE_EDUCATIVA=true
- educativa/certificados → FEATURE_EDUCATIVA=true
- educativa/docentes → FEATURE_EDUCATIVA=true

## Feature flags (estado Etapa 1)
- FEATURE_EDUCATIVA  → true  (E1 — producto central)
- FEATURE_COWORKING  → false (Etapa 2)
- FEATURE_TALLERES   → false (Etapa 2)
- FEATURE_COMUNIDAD  → false (Etapa 3)
- FEATURE_PUBLICA    → false (Etapa 3)

## Design System (obligatorio)
- Dark mode exclusivo. Inter + Lucide React.
- Primario: --inc-violet #9B30FF. Acento: --inc-magenta #C026D3.
- Ver docs/design/DESIGN_SYSTEM_INCADEducativa.md, SHADCN_THEME.md, COMPONENTS.md

## Reglas críticas
- Ningún docente puede publicar contenido directamente
- Los alumnos se importan por CSV, nunca por auto-registro
- Cada cambio de schema requiere migración explícita en supabase/migrations/
- No modificar este archivo sin aprobación del equipo
```

### 14.2 Convenciones de nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `CourseCard.tsx`, `LessonPlayer.tsx` |
| Hooks | camelCase con prefijo `use` | `useCourseProgress.ts` |
| Server actions | camelCase con sufijo `Action` | `enrollUserAction.ts` |
| Rutas App Router | kebab-case | `/cursos/[slug]/lecciones/[id]` |
| Tablas Supabase | snake_case plural | `lesson_progress`, `evaluation_attempts` |
| Feature flags | SCREAMING_SNAKE_CASE | `FEATURE_COWORKING` |
| Variables de entorno cliente | Prefijo `NEXT_PUBLIC_` | `NEXT_PUBLIC_SUPABASE_URL` |

### 14.3 Flujo de trabajo con Claude CLI en Cursor

- Todo feature nuevo arranca con: _"Según el `CLAUDE.md` y el spec, implementá [funcionalidad]"_
- Para cambios de schema: _"Actualizá el schema de Supabase para [caso de uso] respetando los ADRs del spec"_
- Para componentes: _"Creá el componente [nombre] según DESIGN_SYSTEM v2.0 y COMPONENTS.md. shadcn/ui base con SHADCN_THEME, Lucide React, accesible (aria labels, keyboard nav)"_
- Para tests: _"Escribí tests Playwright para el flujo CU-[número] del spec"_
- Nunca pedir a Claude CLI que modifique el `CLAUDE.md` sin aprobación manual

> **El spec es un documento vivo.** Cada vez que se toma una decisión que cambia la arquitectura, el alcance o los casos de uso, se actualiza este documento y se versiona (v3.1, v3.2, etc.). El `CLAUDE.md` en el repositorio siempre referencia la versión vigente.

---

*Escobar, José Gustavo · Schwegler, Alan*  
*INCADEducativa · incadeducativa.com · Junio 2026*
