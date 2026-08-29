---
description: Reconcilia estado local vs remoto y actualiza docs/addenda a la realidad. Requiere aprobación explícita antes de commit/push.
---

Objetivo: que el estado de git y el estado de los docs digan exactamente
lo mismo que verificaste en `/recap`. Nada de esto se ejecuta sin
aprobación explícita en los pasos que mutan git — esto no reemplaza la
regla de CLAUDE.md ("no `git commit` ni `git push` sin aprobación
humana explícita"), la aplica.

## 0. Prerrequisito

Si no corriste `/recap` en esta misma sesión (o el estado cambió desde
entonces), corré `/recap` primero. No reconstruyas el estado de memoria.

## 0.5 Gate check obligatorio

Releé el recap fresco. Si CUALQUIERA de los 4 gates (`tsc`, `lint`,
`test:unit`, o cualquier test específico) vino en rojo, **no armes un
plan de push**. Pasá directo al subproceso de abajo y esperá resolución
antes de seguir con este comando.

### Subproceso: gate roto

1. Mostrá el mensaje de fallo completo (expected vs received, o el
   error de compilación/lint tal cual).
2. Mostrá el diff de los commits sin pushear que tocan el archivo
   afectado: `git log -p origin/main..<rama> -- <archivo>`.
3. Con esa evidencia, presentá las dos hipótesis posibles — cambio de
   comportamiento intencional con expectativa vieja, o regresión real —
   pero **no decidas vos cuál es**. Esperá al usuario.
4. Solo tras la decisión del usuario: aplicá el fix correspondiente
   (al test o al código, según lo que se haya decidido), re-corré los 4
   gates, y recién ahí volvé al paso 1 de este comando.

## 1. Plan, no ejecución todavía

A partir del recap, armá un plan concreto y mostralo ANTES de tocar
nada:

- Qué commits locales existen sin pushear (lista con hash + mensaje)
- Qué archivos tenés sin commitear, si hay
- A qué rama remota van (normalmente la misma rama de trabajo activa,
  nunca directo a `main`)
- Qué iba a decir cada commit en formato Conventional Commits, si los
  commits existentes no lo respetan

Esperá el "dale" del usuario antes de seguir. Si el plan incluye tocar
`main` de cualquier forma (merge, push directo), **frená ahí** — eso es
exclusivamente del prompt de merge, no de este comando.

## 2. Ejecución (solo tras aprobación)

```
git add <archivos específicos, nunca `git add .` a ciegas>
git commit -m "<tipo>(<scope>): <mensaje>"
git push origin <rama>
```

Un commit por unidad lógica de cambio, no un commit gigante con todo
junto.

## 3. Actualizar `docs/addenda/session_handoff.md`

Reemplazá el bloque de estado actual (no lo dupliques agregando otro
bloque abajo — este archivo es un snapshot, no un log; si querés
preservar historial, movelo a una sección `## Handoffs anteriores` al
final del archivo). El bloque nuevo tiene que incluir:

- Fecha y hora
- Rama activa, hash del último commit, si está pusheado
- Resultado real de los 4 gates de CI (del recap)
- **Una línea de política explícita**, por ejemplo:
  `MODO: FREEZE` (no generar features nuevas, solo lo de la cola) o
  `MODO: NORMAL` (la cola está al día, se puede seguir con desarrollo
  normal)
- Próxima tarea sugerida de la cola

Este campo `MODO` es el que lee `/continuar` para decidir si tiene
permiso de generar código nuevo o solo puede tocar lo ya priorizado.

## 4. Actualizar `docs/addenda/resolver_loop1.md`

Marcá cada tarea con su estado real verificado (no el que decía antes).
No borres tareas — si una quedó obsoleta, marcala como tal con una
línea explicando por qué, no la elimines silenciosamente.

## 5. Lo que este comando NUNCA hace

- No mergea PRs a `main`.
- No cambia el valor de ninguna variable de entorno en Vercel/Supabase/
  etc. (eso es 100% manual del usuario, ver runbook GATE).
- No inicia trabajo de una tarea nueva — eso es `/continuar`.

## 6. Salida final

Confirmá qué se commiteó, qué se pusheó, qué cambió en los docs, y
cerrá con: "Puesta a punto completa — MODO: <FREEZE|NORMAL> — listo
para /continuar" con timestamp.
