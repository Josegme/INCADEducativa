# CU-T05 — Lead → Alumno INCADE (verificación)

Caso: Admin convierte un `lead` a `alumno` tras matrícula presencial.

## Precondiciones

- Usuario con `role = lead`
- Admin autenticado (RPC `convert_user_role` + `is_admin()`)
- Carrera existente en `careers`

## Pasos ejecutados (2026-09-22 / 2026-09-23 UTC)

1. Usuario QA `visitante.qa.coworking@example.com` preparado como `lead` (antes `comunidad`).
2. Conversión vía RPC `convert_user_role(...)` como admin `admin.test@incadeducativa.com` (`67f1611e-…`):
   - `p_new_role = alumno`
   - `p_dni = 99111222`
   - `p_carrera_id = Marketing Digital` (`4ef55ae6-…`)
3. Verificación en DB (misma sesión).

> Nota: la UI `/admin/usuarios` → `ConvertRoleModal` llama la misma RPC. Preview Vercel
> sigue detrás de Deployment Protection (SSO); la evidencia se tomó contra la DB
> compartida de preview/QA. Re-validar el click en UI cuando haya `vercel login`.

## Esperado

- [x] `users.role` = `alumno`
- [x] `users.dni` y `users.carrera_id` seteados
- [x] Entrada en `users.role_history` (lead → alumno, `by` = admin)
- [x] Notificación al usuario (`Tu cuenta fue actualizada`)
- [x] Historial previo conservado (conversión aditiva; sin borrado de cuenta)

## Evidencia

| Campo | Valor |
|---|---|
| Fecha | 2026-09-23 00:41 UTC |
| Email lead | visitante.qa.coworking@example.com |
| Carrera asignada | Marketing Digital |
| DNI | 99111222 |
| role_history | `{"from":"lead","to":"alumno","by":"67f1611e-…","at":"2026-09-23T00:41:21.641091+00:00"}` |
| Notificación | id `5f5f3f38-…` tipo sistema |
| Método | RPC `convert_user_role` (misma que `ConvertRoleModal`) |

Marcar `[x]` en `docs/FUNCIONALIDADES.md` solo con esta prueba + Estándar INCADE #14.
