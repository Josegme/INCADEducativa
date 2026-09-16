# CU-T05 — Lead → Alumno INCADE (verificación manual)

Caso: Admin convierte un `lead` (taller gratuito) a `alumno` tras matrícula presencial.

## Precondiciones

- Usuario con `role = lead` (inscripción a taller o alta de prueba)
- Admin autenticado
- Al menos una carrera en `careers`

## Pasos

1. Admin → `/admin/usuarios` (o localizar el lead en `/admin/leads` y buscarlo por email en usuarios)
2. Abrir **Convertir rol** (`ConvertRoleModal`)
3. Nuevo rol: `alumno`
4. Completar DNI + carrera (obligatorios para alumno)
5. Confirmar → RPC `convert_user_role(...)` (nunca `UPDATE` directo de `role`)

## Esperado

- [ ] `users.role` = `alumno`
- [ ] `users.dni` y `users.carrera_id` seteados
- [ ] Entrada en `users.role_history` (conversión aditiva, ADR-16)
- [ ] Notificación al usuario
- [ ] Historial de talleres/puntos/pagos **conservado** (no se borra)

## Evidencia

| Campo | Valor |
|---|---|
| Fecha | |
| Email lead | |
| Carrera asignada | |
| Screenshot / nota | |

Marcar `[x]` en `docs/FUNCIONALIDADES.md` solo con esta prueba firmada + Estándar INCADE #14.
