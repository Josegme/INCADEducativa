---
description: Auditoría de estado real del proyecto (solo lectura, cero confianza en docs o memoria de sesión)
---

Vas a producir un recap del estado REAL de INCADEducativa. Regla cero:
**no confíes en nada que ya esté escrito en `docs/addenda/`, `CLAUDE.md` ni en
tu propia memoria de sesiones anteriores** — todo eso pudo quedar viejo.
Cada afirmación del recap tiene que salir de un comando que corriste ahora
mismo. Este comando es **solo lectura**: no commiteás, no pusheás, no
mergeás, no editás código ni docs.

## 1. Estado de git (local vs remoto)

```
git branch --show-current
git status --short
git log --oneline -5
git log @{u}.. --oneline          # commits locales sin pushear
git fetch origin --quiet
git log origin/main --oneline -3
git log <tu-rama> --oneline -5
git log origin/main..<tu-rama> --oneline   # todo lo que main no tiene
```

Reportá explícitamente: ¿hay commits locales sin pushear? ¿la rama local
está adelantada respecto al remoto con el mismo nombre?

## 2. Estado del PR / CI

Si `gh` está autenticado:

```
gh pr view <tu-rama> --json state,mergeable,statusCheckRollup
gh run list --branch <tu-rama> --limit 3
```

Sin `gh` o sin permisos: decilo explícitamente, no inventes un estado.
Marcá esa parte como BLOCKED-ESPERANDO-HUMANO en vez de asumir.

## 3. Gates de `ci.yml` en el estado actual

Corré exactamente lo que corre CI, en este orden, y pegá el resultado
real de cada uno (no resumas "todo bien" sin mostrar la salida):

```
npm ci
npx tsc --noEmit
npm run lint
npm run test:unit
```

`next build` solo si el usuario lo pide explícitamente (tarda más).

## 4. Conteo real de recursos que suelen quedar desactualizados en docs

```
ls supabase/migrations/ | sort | tail -3     # última migración real
ls supabase/migrations/ | wc -l              # conteo real
```

Nunca copies un número de un doc viejo — contá ahora.

## 4.5. Estado de Supabase (si hay CLI logueado)

```
supabase projects list 2>&1 | head -20
```

Si falla por falta de login o CLI no instalado: reportá DESCONOCIDO
explícitamente para T7, no asumas que la ausencia de output significa
que el proyecto de staging no existe — no hay forma de verificar esto
sin el CLI logueado o acceso directo al dashboard.

## 5. Variables de entorno: existencia, nunca valores

Para cada variable en `.env.example`, chequeá si existe una línea no
vacía en `.env.local` (**nunca imprimas el valor**, ni parcial):

```
comm -13 <(grep -oE '^[A-Z_]+=' .env.example | sort -u) <(grep -oE '^[A-Z_]+=.+' .env.local 2>/dev/null | grep -oE '^[A-Z_]+=' | sort -u)
```

Eso te da las variables declaradas en `.env.example` que NO tienen valor
cargado en `.env.local` — son señal de qué GATE sigue realmente
pendiente a nivel local (no dice nada de Vercel, eso no se puede
verificar desde acá).

## 6. Contrastar contra lo documentado (sin corregir todavía)

Leé `docs/addenda/resolver_loop1.md` y `docs/addenda/session_handoff.md`
y compará cada afirmación contra lo que verificaste en los pasos 1-5.
Listá las discrepancias explícitamente — no las corrijas en este modo,
eso es trabajo de `/poner-a-punto`.

## 7. Salida final

Un resumen ejecutivo de 3-4 líneas arriba de todo, y después un bloque
por tarea de la cola (T1-T9 + cualquier trabajo fuera de cola que
encuentres), formato fijo:

```
TAREA: <n>
ESTADO: DONE | EN RAMA SIN MERGEAR | BLOCKED | DESCONOCIDO
VERIFICACIÓN: <comando corrido y resultado real>
DISCREPANCIA CON DOCS: <si la doc decía otra cosa, decilo acá>
```

Cerrá con una línea: "Recap fresco: SÍ — listo para /poner-a-punto o
/continuar" con timestamp. Sin esa línea, `/continuar` se va a negar a
arrancar.
