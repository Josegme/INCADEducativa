# Primeros pasos — INCADEducativa en Cursor + Claude Code
**Design-first · v3.4 · Junio 2026**

> Leer en este orden antes de empezar: `CLAUDE.md` → `docs/design/DESIGN_SYSTEM_INCADEducativa.md` → este archivo.

---

## Paso 0 — Verificar documentación v3.4 (30 min · humano)

Antes de escribir una sola línea de código, confirmar que los documentos no tienen divergencias:

- [ ] `CLAUDE.md` versión 3.4 — Design System v2.0 en regla #8 y sección "Design System"
- [ ] `docs/design/DESIGN_SYSTEM_INCADEducativa.md` v2.0 — violeta primario `#9B30FF`
- [ ] `docs/design/SHADCN_THEME.md` — mapeo tokens → shadcn presente
- [ ] `docs/design/COMPONENTS.md` — catálogo mínimo E1 presente
- [ ] `docs/mockups/INCADEducativa_Mockup_v4.html` — tokens DS v2.0 aplicados
- [ ] Mockup v3 archivado en `docs/mockups/archive/` — no usar como referencia

Si algún doc está desactualizado → actualizar el doc primero (SDD: spec antes que código).

---

## Paso 1 — Setup del entorno (15 min)

```bash
# Inicializar Next.js DENTRO de esta carpeta (los docs ya están acá)
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir=false

# Si pregunta por sobrescribir archivos existentes: NO sobrescribir
# CLAUDE.md, docs/, supabase/, README.md, .env.example

# Dependencias core
npm install @supabase/supabase-js @supabase/ssr @trpc/server @trpc/client zod
npm install resend qrcode @react-pdf/renderer lucide-react
npm install -D vitest @playwright/test

# shadcn/ui — seleccionar cssVariables: true durante el init
npx shadcn@latest init
```

> `lucide-react` es obligatorio en el install (DS regla #8 — ícono exclusivo del proyecto).
> En el `shadcn@latest init`, confirmar `Use CSS variables for colors? → Yes`.

---

## Paso 2 — Design System en código (20 min) ← ANTES de Supabase

Con Next.js inicializado, aplicar el DS antes de cualquier componente:

**2a. Reemplazar `src/app/globals.css`** con el bloque completo del DS §5:
- Importar Inter desde Google Fonts (primera línea)
- Variables `:root` del DS (`--inc-*` y `--edu-*`)
- Bloque de mapeo shadcn de `docs/design/SHADCN_THEME.md`
- Estilos `body`: Inter, `#08080F`, 14px, line-height 1.65

**2b. Reemplazar `tailwind.config.ts`** con el bloque del DS §5:
- `darkMode: 'class'`
- Colores `inc` y `edu` extendidos
- `fontFamily.sans`: Inter
- Radios: sm/md/lg/xl/pill
- Sombras: card/card-violet/modal

**2c. Agregar `class="dark"` en `<html>`** del `src/app/layout.tsx`:
```tsx
<html lang="es" className="dark">
```

**2d. Verificar:**
```bash
npm run dev
# Abrir http://localhost:3000
# ✓ Fondo negro-violeta oscuro (#08080F)
# ✓ Tipografía Inter cargada (verificar en DevTools → Network → Fonts)
# ✗ Si el fondo es blanco → revisar globals.css y class="dark" en <html>
```

---

## Paso 3 — Supabase (10 min)

1. Crear proyecto en supabase.com → región São Paulo (más cercana a Posadas)
2. SQL Editor → ejecutar las migraciones E1 **en este orden**:
   `001_educativa_core.sql` → `003_motor_evaluaciones_comunicacion.sql` → `004_conversion_roles.sql` → `005_rls_fixes_e1.sql`
3. Verificar en Table Editor que las **18 tablas** existen (13 de 001 + 5 de 003)
4. Authentication → crear el primer usuario admin manualmente
5. SQL Editor → `update public.users set role = 'admin' where email = 'tu@email.com';`
6. Copiar URL y keys a `.env.local` (desde `.env.example`)

⚠️ NO ejecutar `002_coworking_module.sql` todavía — es Etapa 2 (solo con `FEATURE_COWORKING`).

---

## Paso 4 — Primer prompt en Claude Code

Abrí Cursor en esta carpeta y en el chat escribí:

```
Leé CLAUDE.md v3.4, docs/design/DESIGN_SYSTEM_INCADEducativa.md v2.0
y docs/design/COMPONENTS.md.

Confirmame que entendés:
- Las 3 etapas, los 6 roles, las 13 reglas críticas y los feature flags
- Los tokens visuales: primario #9B30FF, superficies, tipografía Inter, Lucide
- El mapeo shadcn de SHADCN_THEME.md

Luego, con globals.css y tailwind.config.ts ya configurados (NO redefinir tokens):
1. Generá la estructura de carpetas del App Router según CLAUDE.md
2. Creá los shell components vacíos: AuthLayout, DashboardLayout, Sidebar, Topbar
   usando shadcn/ui base, tokens --edu-* e --inc-*, Lucide React
3. Creá /design-preview: página estática con muestra de
   Button (primary/outline/destructive), Card, Badge (los 6 estados LMS),
   Input, Progress bar, y el banner de notificación (info/success/warning/danger)

No implementes lógica de negocio ni Supabase todavía.
```

---

## Paso 5 — Desarrollo por sprints

Seguí `docs/LIFECYCLE_PLAN.md` sprint a sprint:

- **Fase 0A**: Design Foundation ← ya completado en pasos 0–4
- **Fase 0B**: Infra (Vercel, GitHub Actions, Sentry, dominio)
- **Sprint 1–2**: Auth + roles + importación CSV
- **Sprint 3–4**: Catálogo + inscripción
- **Sprint 5–6**: Player + progreso
- **Sprint 7–8**: Panel docente + revisión
- **Sprint 9–10**: Certificados + puntos + QA → launch v1.0.0

Cada feature completada → marcar el checkbox en `docs/FUNCIONALIDADES.md`.

---

## Paso 6 — Regla de oro del SDD (ampliada)

Si hay una contradicción entre documentos o código:

1. **Parar**
2. Identificar cuál fuente está mal:
   - **DS malo** → actualizar DS (versionar v2.1) → actualizar mockup v4 → actualizar código
   - **Spec malo** → actualizar Spec (versionar la siguiente: v3.5, v3.6…) → actualizar LIFECYCLE → implementar
   - **Código malo** → corregir el código para que respete el doc
3. **Nunca** dejar que código, spec y DS diverjan entre sí

---

## Correcciones ya aplicadas en esta base (v3.4)

✅ Etapas reconciliadas: E1=Educativa (producto central), E2=Coworking, E3=Pública
✅ Flag FEATURE_EDUCATIVA agregado y consistente en todos los docs
✅ RLS sin recursión: función is_admin() security definer en todas las policies
✅ Verificación pública de certificados: RPC verify_certificate(uuid) con grant a anon
✅ Ledger append-only protegido a nivel DB (triggers que bloquean UPDATE/DELETE)
✅ Tabla audit_log agregada (13 tablas en migración 001; E1 completo = 18 tablas tras 001+003+004)
✅ Coworking: no-show detection function, descuento institucional, incidencias, cupones
✅ Design System v2.0 adoptado: violeta real #9B30FF, Inter, Lucide, tokens --edu-* e --inc-*
✅ Mockup v4 generado con DS v2.0 — v3 archivado en docs/mockups/archive/
✅ SHADCN_THEME.md y COMPONENTS.md creados como fuentes de verdad de implementación
