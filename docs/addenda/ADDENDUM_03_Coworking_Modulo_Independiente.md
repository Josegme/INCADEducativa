# ADDENDUM 03 — Coworking: Módulo Independiente con Acceso Comunitario
**INCADEducativa · Spec v3 — Addendum**
**Fecha:** Junio 2026
**Autores:** JosegmeDev + Alan Schwegler

> ⚠️ **DOCUMENTO ARCHIVADO — referencia histórica, no editar.**
> Su contenido fue integrado por completo en `docs/INCADEducativa_Spec_v3.md` v3.4
> (§4, §5 CU-06, §6 reescrito, ADR-13), `docs/FUNCIONALIDADES.md` (§2.2, §5.5, §6, §7),
> `docs/LIFECYCLE_PLAN.md` (Sprints 11-16) y `supabase/migrations/002_coworking_module.sql`.
> La fuente de verdad vigente es el Spec v3.4.

---

## Contexto

La Spec v3 trata el módulo de Coworking principalmente como un beneficio para alumnos INCADE activos. Este addendum redefine su posicionamiento: el Coworking es un **servicio independiente con fuente de ingreso propia**, abierto a la comunidad general, que convive dentro de la misma plataforma `incadeducativa.com` bajo el feature flag `FEATURE_COWORKING`.

Los alumnos INCADE activos tienen descuento institucional automático, pero el módulo no depende del módulo educativo para funcionar — tiene su propio flujo de acceso, su propia gestión admin y su propio panel de ingresos.

---

## 1. Redefinición del módulo Coworking

### 1.1 Posicionamiento

| Atributo | Definición |
|---|---|
| **Tipo** | Módulo de servicio independiente con feature flag `FEATURE_COWORKING` |
| **Acceso** | Público — cualquier persona puede reservar, con o sin cuenta educativa |
| **Relación con LMS** | Comparte dominio, auth y perfil de usuario. No depende del progreso educativo |
| **Fuente de ingreso** | Independiente del módulo educativo — se reporta por separado |
| **Gestión** | Panel admin propio con dashboard de ocupación, ingresos y gestión de espacios |

### 1.2 Usuarios que pueden reservar

| Perfil | Acceso | Precio | Observación |
|---|---|---|---|
| Alumno INCADE activo | Sí | Precio con descuento institucional (% configurable) | Descuento automático por rol, sin código necesario |
| Usuario Comunidad Online | Sí | Precio público | Mismo flujo que cualquier visitante registrado |
| Lead / Visitante registrado | Sí | Precio público | Puede reservar tras crear cuenta gratuita |
| Usuario sin cuenta | No | — | Requiere registro mínimo para reservar |
| Docente / Coordinador | Sí | Precio con descuento institucional | Mismo nivel que alumno INCADE |
| Admin | Sí | Sin cargo (gestión interna) | Puede crear reservas manuales |

---

## 2. Acceso al módulo desde la plataforma

### 2.1 Desde la landing pública (sin login)

El módulo Coworking es visible en la navegación principal de `incadeducativa.com` como sección independiente. El visitante puede:

- Ver los espacios disponibles, fotos, capacidad, servicios y precios.
- Ver el calendario de disponibilidad en tiempo real.
- Para reservar: el sistema solicita registro o login (flujo mínimo: nombre + email + contraseña).

### 2.2 Desde el dashboard del usuario logueado

El usuario logueado ve el acceso al Coworking en la barra de navegación principal de la plataforma, al mismo nivel que "Mis cursos" y "Catálogo". No es un submódulo del panel educativo — es un ítem de primer nivel en la navegación.

### 2.3 Desde el panel del Alumno INCADE

El alumno INCADE ve en su dashboard una tarjeta de acceso rápido al Coworking con el precio con descuento ya visible. El descuento se aplica automáticamente al iniciar el flujo de reserva, sin código ni validación manual.

---

## 3. Flujo de reserva público (usuario sin descuento)

1. Usuario accede a la sección Coworking (con o sin login previo).
2. Selecciona sede (si hay más de una).
3. Explora la grilla de espacios: fotos, capacidad, servicios incluidos y precio por hora/día.
4. Selecciona fecha y horario desde el calendario de disponibilidad en tiempo real.
5. Configura servicios adicionales si aplica (sala de reuniones, proyector, etc.).
6. Ve el resumen con el precio total.
7. Si no está logueado: el sistema solicita registro o login antes de continuar.
8. Paga mediante MercadoPago (Checkout Pro o Brick embebido).
9. Webhook MP confirma el pago → reserva pasa a estado `CONFIRMADA`.
10. Sistema genera QR de acceso + envía confirmación por email + WhatsApp.

## 4. Flujo de reserva con descuento institucional (Alumno INCADE)

Igual al flujo público, con las siguientes diferencias:

- En el paso 3, los precios ya se muestran con el descuento aplicado (el sistema detecta el rol al estar logueado).
- En el paso 6, el resumen muestra el precio original tachado y el precio con descuento.
- No requiere código de descuento ni validación adicional.
- El porcentaje de descuento es configurable desde el panel admin por tipo de espacio.

---

## 5. Panel Admin del Coworking

El admin tiene un panel dedicado al Coworking, separado del panel de gestión educativa, con las siguientes vistas:

### 5.1 Dashboard de ocupación

- Mapa visual de espacios por sede: ocupado / disponible / bloqueado.
- Reservas del día ordenadas por horario.
- Tasa de ocupación del día, semana y mes.
- Alertas de no-show pendientes.

### 5.2 Gestión de reservas

- Lista de todas las reservas con filtros: estado, fecha, espacio, tipo de usuario.
- Check-in manual (toca "Presente" en la lista) y check-in por QR.
- Creación de reservas manuales por el admin (sin pago online, para acuerdos directos).
- Cancelación y reprogramación de reservas con notificación automática al usuario.

### 5.3 Gestión de espacios

- Alta, baja y edición de espacios por sede.
- Configuración de precio por hora, medio día y día completo por espacio.
- Configuración de descuento institucional por espacio o global.
- Bloqueos temporales (mantenimiento, eventos institucionales).
- Horarios de disponibilidad por día de la semana.

### 5.4 Panel de ingresos del Coworking

- Ingresos totales del período (día / semana / mes / personalizado).
- Desglose por espacio, por tipo de usuario (comunidad vs institucional) y por sede.
- Comparativo de períodos.
- Exportación a CSV para contabilidad.

Este panel de ingresos es **independiente** del panel financiero del módulo educativo. Los ingresos del Coworking y los ingresos por cursos/suscripciones se reportan por separado.

---

## 6. Integración con el módulo educativo (puntos de contacto mínimos)

Aunque el Coworking es independiente, mantiene los siguientes puntos de integración con el módulo educativo:

| Integración | Descripción |
|---|---|
| Auth compartida | Un solo login para ambos módulos. El perfil es el mismo. |
| Descuento por rol | El sistema detecta automáticamente el rol `ALUMNO_INCADE` y aplica el descuento sin intervención del usuario. |
| Canje de puntos | Los puntos acumulados por completar cursos pueden canjearse como crédito para reservas de Coworking (configuración del admin). |
| Reserva de aula para tutorías | Cuando el docente agenda una tutoría presencial, el módulo Coworking bloquea el aula automáticamente sin flujo de pago (uso institucional interno). |
| Historial unificado en el perfil | El perfil del usuario muestra historial de cursos y de reservas de Coworking en el mismo lugar. |

---

## 7. Gestión de no-shows

- Cron job detecta reservas en estado `CONFIRMADA` que pasaron 15 minutos del inicio sin check-in.
- Cambia el estado a `NO_SHOW`.
- Notifica al usuario por email.
- Notifica al admin en su panel.
- El admin puede configurar si el no-show genera penalización (bloqueo temporal de reservas) o es solo registro.

---

## 8. Feature flag y activación por etapa

```
FEATURE_COWORKING=true   → activa el módulo completo
FEATURE_COWORKING=false  → la sección no aparece en navegación ni en dashboard
```

El módulo se activa en **Etapa 2** según el plan de desarrollo. En Etapa 1 (MVP Educativo) el flag permanece desactivado. Al activarse en E2, los alumnos INCADE ya cargados en el sistema reciben automáticamente el descuento institucional sin ninguna configuración adicional.

---

## 9. Criterios de aceptación

| Criterio | Métrica |
|---|---|
| Un usuario externo puede reservar desde cero | En menos de 5 pasos |
| El descuento institucional se aplica automáticamente | Sin código ni acción del usuario |
| Confirmación de reserva post-pago | En menos de 3 segundos tras webhook MP |
| Cero errores de doble asignación de espacio | Validación de disponibilidad en tiempo real con bloqueo optimista |
| El panel de ingresos carga el período mensual | En menos de 2 segundos |
| Check-in manual | En menos de 5 segundos |
| Check-in por QR | Validación en menos de 2 segundos |

---

*INCADEducativa · ADDENDUM 03 · Coworking — Módulo Independiente con Acceso Comunitario*
*INCADE Escuela de Negocios — Posadas, Misiones*
