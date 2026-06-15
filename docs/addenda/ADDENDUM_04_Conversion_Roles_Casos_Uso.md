# ADDENDUM 04 — Conversión de Roles y Casos de Uso de Transición
**INCADEducativa · Spec v3 — Addendum**
**Fecha:** Junio 2026
**Autores:** JosegmeDev + Alan Schwegler

> ⚠️ **DOCUMENTO ARCHIVADO — referencia histórica, no editar.**
> Su contenido fue integrado en `docs/INCADEducativa_Spec_v3.md` v3.4
> (§4 roles, §5.2 CU-T01..CU-T06, §10 schema, §11.1, ADR-15 y ADR-16),
> `docs/FUNCIONALIDADES.md` (§2.1, §1.2, §5.3, §6, §7),
> `docs/LIFECYCLE_PLAN.md` (Sprints 1-4 y Etapa 3) y `supabase/migrations/004_conversion_roles.sql`.
> **Nota de adaptación:** el addendum usaba `profiles`/`ALUMNO_INCADE`/`USUARIO_COMUNIDAD`;
> el schema real usa `public.users` con el enum `user_role` (`alumno`/`comunidad`/`lead`).
> El ADR-07 propuesto se renumeró a ADR-15 (ADR-07 ya estaba en uso).
> La fuente de verdad vigente es el Spec v3.4.

---

## Contexto

La Spec v3 define los seis perfiles del sistema de forma estática — cómo entra cada uno y qué puede hacer — pero no contempla los casos de transición entre roles: qué pasa cuando un usuario cambia de contexto (se matricula, paga un curso, el admin le cambia el perfil). Este addendum cierra todos los gaps de conversión de rol identificados en la revisión de casos de uso del 14 de junio de 2026.

---

## 1. Decisión de arquitectura — ADR-07: Carreras exclusivas para Alumnos INCADE

| Campo | Detalle |
|---|---|
| **Decisión** | Las carreras completas con certificación INCADE son exclusivas del rol `ALUMNO_INCADE`. Un Usuario Comunidad Online no puede inscribirse a una carrera desde la plataforma. |
| **Justificación** | Las carreras representan el activo institucional más valioso de INCADE. Su validez depende del proceso de admisión presencial: documentación, matrícula física, certificaciones oficiales. Permitir el acceso online sin ese proceso diluiría el valor del título. |
| **Consecuencia para el producto** | La plataforma muestra las carreras en el catálogo público como vitrina, pero el CTA para un usuario no autenticado o con rol `USUARIO_COMUNIDAD` es "Inscribite en el Instituto" — no "Comprar". |
| **Canal de conversión** | La plataforma actúa como captación para el Instituto. Un usuario de comunidad que quiere hacer una carrera es derivado a admisiones presenciales (CTA → sitio institucional o WhatsApp). Una vez matriculado, el admin le migra el rol en plataforma. |

---

## 2. Mapa completo de conversiones de rol posibles

```
VISITANTE (sin cuenta)
    │
    ├─► Se registra para taller gratuito ──────────► LEAD
    │                                                   │
    │                                                   ├─► Paga un curso ──► USUARIO_COMUNIDAD_ONLINE
    │                                                   │
    │                                                   └─► Se matricula en INCADE (presencial)
    │                                                           │
    ├─► Se registra y paga un curso ───────────────► USUARIO_COMUNIDAD_ONLINE
    │                                                   │
    │                                                   └─► Se matricula en INCADE (presencial)
    │                                                           │
    └─► (Admin importa CSV) ───────────────────────► ALUMNO_INCADE ◄──────────────────────┘
                                                          │
                                                          └─► Admin habilita permisos docentes ──► DOCENTE
```

---

## 3. Casos de uso de transición — detalle por escenario

### CU-T01: Alumno INCADE se inscribe a un curso gratuito adicional

| Campo | Detalle |
|---|---|
| **Actor** | Alumno INCADE autenticado |
| **Situación** | El alumno ya tiene cuenta activa. Encuentra un curso gratuito en el catálogo que no pertenece a su carrera asignada. |
| **Flujo** | 1. Alumno ve el catálogo → 2. Selecciona curso gratuito → 3. Hace clic en "Inscribirse" → 4. Sistema crea enrollment sin flujo de pago → 5. Acceso habilitado inmediatamente |
| **Rol resultante** | `ALUMNO_INCADE` — sin cambio. El curso queda en su panel como "curso adicional" fuera de su mapa de carrera. |
| **Beneficios** | Mantiene todos los beneficios del rol: descuento coworking, puntos, tutorías según corresponda al curso. |
| **Sin acción del admin** | El admin no interviene. Es autoservicio completo. |

---

### CU-T02: Usuario Comunidad intenta acceder a una carrera

| Campo | Detalle |
|---|---|
| **Actor** | Usuario Comunidad Online autenticado |
| **Situación** | El usuario navega el catálogo y encuentra una carrera completa que le interesa. |
| **Flujo** | 1. Usuario ve la página de la carrera → 2. El sistema detecta rol `USUARIO_COMUNIDAD` → 3. En lugar del botón "Inscribirse", muestra el bloque informativo: *"Las carreras INCADE requieren matrícula presencial en el Instituto. Conocé el proceso de admisión."* → 4. CTA → sitio institucional incade.edu.ar o WhatsApp de admisiones |
| **Rol resultante** | Sin cambio. El usuario no puede inscribirse desde la plataforma. |
| **Nota UX** | La carrera es visible en el catálogo como vitrina: descripción, materias, duración, salida laboral, docentes. Solo el acceso está bloqueado, no la información. |

---

### CU-T03: Lead paga su primer curso → sube a Usuario Comunidad

| Campo | Detalle |
|---|---|
| **Actor** | Lead (visitante registrado en taller gratuito) |
| **Situación** | El lead completó el taller gratuito y decide pagar un curso de la secuencia de nurturing. |
| **Flujo** | 1. Lead hace clic en CTA del curso pago → 2. Flujo MercadoPago → 3. Webhook MP confirma pago → 4. Sistema cambia rol automáticamente de `LEAD` a `USUARIO_COMUNIDAD_ONLINE` → 5. Habilita acceso al curso pagado → 6. Notificación de bienvenida como nuevo miembro de la comunidad |
| **Rol resultante** | `USUARIO_COMUNIDAD_ONLINE` — automático, sin intervención del admin. |
| **Historial** | El taller gratuito completado queda en su historial. Sus puntos (si los hubiera) se transfieren. |
| **DB** | `UPDATE profiles SET role = 'USUARIO_COMUNIDAD' WHERE id = [user_id]` — el campo `role` es el único que cambia. El resto del perfil se preserva intacto. |

---

### CU-T04: Usuario Comunidad se matricula en INCADE → migración a Alumno INCADE

| Campo | Detalle |
|---|---|
| **Actor** | Admin + Usuario Comunidad existente |
| **Situación** | Un usuario que ya tenía cuenta en la plataforma como comunidad se presenta en el Instituto, completa el proceso de admisión presencial y se matricula. El admin debe reflejar este cambio en la plataforma. |
| **Flujo** | 1. Admin accede al panel de usuarios → 2. Busca al usuario por email o nombre → 3. Abre el perfil → 4. Hace clic en "Convertir a Alumno INCADE" → 5. Sistema solicita confirmación: DNI y carrera a asignar → 6. Admin completa los datos → 7. Sistema cambia el rol a `ALUMNO_INCADE`, asigna la carrera, activa los beneficios institucionales (descuento coworking, tutorías incluidas, puntos) → 8. El usuario recibe notificación: "Tu cuenta fue actualizada a Alumno INCADE. Ya podés acceder a todos tus beneficios." |
| **Rol resultante** | `ALUMNO_INCADE` |
| **Historial preservado** | Todos los cursos completados, certificados obtenidos, puntos acumulados y pagos realizados se conservan. La migración es aditiva — solo se suman beneficios, no se pierde nada. |
| **Nuevo acceso** | El usuario ahora ve el mapa de carrera asignada, el descuento en coworking y las tutorías incluidas según el plan de su carrera. |
| **DB** | `UPDATE profiles SET role = 'ALUMNO_INCADE', carrera_id = [id], dni = [dni] WHERE id = [user_id]` |

---

### CU-T05: Lead se matricula en INCADE sin haber pagado ningún curso

| Campo | Detalle |
|---|---|
| **Actor** | Admin + Lead existente |
| **Situación** | Un lead que solo hizo el taller gratuito decide matricularse directamente en el Instituto sin pasar por Usuario Comunidad. |
| **Flujo** | Igual que CU-T04. El admin busca el perfil (puede existir como `LEAD`), lo convierte directamente a `ALUMNO_INCADE` asignando DNI y carrera. |
| **Rol resultante** | `ALUMNO_INCADE` — saltea el rol `USUARIO_COMUNIDAD`. |
| **Historial preservado** | El taller gratuito completado queda en el historial. |

---

### CU-T06: Alumno INCADE al que el admin habilita como Docente

| Campo | Detalle |
|---|---|
| **Actor** | Admin |
| **Situación** | Un alumno egresado o un profesional que ya tiene cuenta como alumno es convocado como docente para un curso nuevo. |
| **Flujo** | 1. Admin abre el perfil del alumno → 2. Activa el permiso `can_teach` → 3. Asigna el curso a dictar → 4. El usuario ve ahora tanto su panel de alumno como el panel docente del curso asignado — dos vistas disponibles desde el mismo login. |
| **Rol resultante** | Rol dual: mantiene `ALUMNO_INCADE` + permisos docentes en los cursos asignados. No es necesario crear una cuenta nueva. |
| **Nota** | Los permisos docentes son granulares por curso — no es un rol global. El usuario puede ser docente en un curso y alumno en otro simultáneamente. |

---

## 4. Reglas de negocio que aplican a todas las transiciones

**Regla 1 — Preservación de historial:** ninguna conversión de rol elimina datos previos. Cursos completados, certificados, puntos y pagos se preservan siempre.

**Regla 2 — El rol es aditivo:** al subir de rol, el usuario gana beneficios. Nunca pierde acceso a contenido ya desbloqueado.

**Regla 3 — Las carreras no son comprables:** ningún flujo automático (pago, webhook, nurturing) puede asignar una carrera. Las carreras solo las asigna el admin manualmente, como reflejo de una matrícula presencial real.

**Regla 4 — Un email = un perfil:** no se crean cuentas duplicadas. Si un usuario ya existe con un email, la conversión de rol ocurre sobre el perfil existente.

**Regla 5 — Notificación en toda conversión:** cualquier cambio de rol dispara una notificación in-app + email al usuario informando qué cambió y qué nuevos accesos tiene disponibles.

---

## 5. Impacto en el schema de base de datos

La tabla `profiles` debe soportar todas las transiciones sin pérdida de datos:

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS dni          TEXT,
  ADD COLUMN IF NOT EXISTS carrera_id   UUID REFERENCES carreras(id),
  ADD COLUMN IF NOT EXISTS can_teach    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS role_history JSONB DEFAULT '[]'::jsonb;
```

El campo `role_history` registra cada cambio de rol con timestamp y el admin que lo realizó:

```json
[
  { "from": "LEAD", "to": "USUARIO_COMUNIDAD", "at": "2026-06-14T10:30:00Z", "by": "system" },
  { "from": "USUARIO_COMUNIDAD", "to": "ALUMNO_INCADE", "at": "2026-07-01T09:15:00Z", "by": "admin_uuid" }
]
```

---

## 6. Impacto en políticas RLS

Las políticas RLS deben actualizarse para contemplar:

- Un usuario con `can_teach = true` tiene acceso de escritura a los cursos asignados como docente, independientemente de su rol base.
- Un `ALUMNO_INCADE` puede ver precios con descuento en coworking — la política de precios debe leer el campo `role` del perfil autenticado.
- Las carreras solo son visibles como "inscribibles" para `ALUMNO_INCADE`. Para otros roles, la vista es de solo lectura (vitrina).

---

## 7. CTA para usuarios no elegibles a carreras — copy sugerido

Para implementar en la UI cuando un `USUARIO_COMUNIDAD` o `LEAD` visita una página de carrera:

```
┌─────────────────────────────────────────────────────┐
│  🎓 Esta carrera requiere matrícula presencial       │
│                                                     │
│  Las carreras INCADE forman parte del programa      │
│  oficial del Instituto. Para inscribirte necesitás  │
│  completar el proceso de admisión en sede.          │
│                                                     │
│  [Conocer el proceso de admisión →]                 │
│  [Hablar con admisiones por WhatsApp →]             │
│                                                     │
│  ¿Mientras tanto? Explorá nuestros cursos y         │
│  talleres disponibles online.                       │
│  [Ver catálogo de cursos →]                         │
└─────────────────────────────────────────────────────┘
```

---

## 8. Checklist de impacto en el Spec v3

Secciones del Spec v3 que deben actualizarse o ampliarse a partir de este addendum:

- [ ] **Sección 4 — Roles y perfiles:** agregar columna "Puede convertirse en" al cuadro de perfiles
- [ ] **Sección 5 — Casos de uso:** agregar CU-T01 a CU-T06 como casos de uso de transición
- [ ] **Sección 11.1 — Flujo activación de cuenta:** agregar rama de migración de rol desde perfil existente
- [ ] **Schema DB — tabla `profiles`:** agregar campos `dni`, `carrera_id`, `can_teach`, `role_history`
- [ ] **ADRs — Sección 13:** registrar ADR-07 (carreras exclusivas para Alumnos INCADE)
- [ ] **UI/UX — catálogo público:** definir vista de carrera para roles no elegibles con CTA a admisiones

---

*INCADEducativa · ADDENDUM 04 · Conversión de Roles y Casos de Uso de Transición*
*INCADE Escuela de Negocios — Posadas, Misiones*
*Revisión: 14 de junio de 2026*
