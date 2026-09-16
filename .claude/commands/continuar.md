---
description: Retoma desarrollo real desde la cola priorizada. Se niega a arrancar sin un /recap + /poner-a-punto frescos en la sesión.
---

## 0. Guard clause — no negociable

Antes de escribir una sola línea: ¿corriste `/recap` y `/poner-a-punto`
en ESTA sesión, y `/poner-a-punto` cerró con "Puesta a punto completa"?

- **No** → frená acá. Decile al usuario: "No puedo continuar sin saber
  dónde estamos. Corré /recap primero." No lo hagas vos automáticamente
  sin que te lo pidan — es una decisión del usuario, no tuya.
- **Sí** → seguí.

## 1. Leer la política

Abrí `docs/addenda/session_handoff.md`, leé el campo `MODO`:

- `MODO: FREEZE` → solo podés trabajar en tareas que ya estén en
  `docs/addenda/resolver_loop1.md`. Cero features nuevas, cero "ya que
  estoy, aprovecho y agrego X". Si no hay ninguna tarea AUTO disponible
  en la cola, decilo y parate — no inventes trabajo para no estar
  ocioso.
- `MODO: NORMAL` → podés proponer trabajo nuevo, pero primero ofrecé
  las tareas pendientes de la cola.

## 2. Elegir UNA tarea

De `docs/addenda/resolver_loop1.md`, tomá la primera tarea no-DONE en
orden de prioridad real (no orden numérico ciego — si T6 es urgente por
seguridad y T9 es cosmético, T6 va primero aunque el número diga otra
cosa).

- **Si es AUTO** (la podés resolver con código, sin credenciales
  externas): implementala.
- **Si es GATE** (necesita dashboard externo, secretos, compra de
  dominio, etc.): pará ahí. Decí exactamente qué acción manual falta y
  remitite al runbook GATE — no intentes un workaround en código para
  esquivar un bloqueo que es inherentemente manual.

## 3. Verificación antes de dar por terminada

```
npx tsc --noEmit
npm run lint
npm run test:unit
```

Si alguno falla, arreglalo antes de reportar nada como DONE.

## 4. Commit — con aprobación, como siempre

Mostrá el diff, proponé el mensaje en Conventional Commits, esperá
aprobación explícita antes de `git commit`. No hagas `git push` sin
aprobación aparte, aunque ya hayas commiteado.

## 5. Una tarea por invocación

No encadenes automáticamente a la siguiente tarea de la cola. Terminá,
reportá, y esperá que el usuario corra `/continuar` de nuevo (o te pida
explícitamente que sigas). Esto es intencional: evita que una sesión
larga derive en generar features no pedidas mientras la cola real queda
sin tocar.

## 6. Actualizar `session_handoff.md`

Al cerrar, actualizá el snapshot (no lo dupliques) con: qué tarea se
tocó, su estado nuevo, y si el `MODO` debería cambiar.

## 7. Reporte final

```
TAREA: <n>
ESTADO: DONE | BLOCKED | FAILED
VERIFICACIÓN: <comandos corridos y resultado real>
SIGUIENTE ACCIÓN REQUERIDA: <qué necesita el usuario, si algo>
```
