# Runbook — Seña coworking → saldo (Etapa 6 con token MP)

Ejecutar **juntos** cuando exista `MP_ACCESS_TOKEN` en el ambiente (sandbox o prod).

## Precondiciones

- Flag `FEATURE_COWORKING=true`
- Espacio activo con precio/hora > 0
- Usuario de prueba (comunidad o alumno)
- Webhook MP apuntando a `{APP_URL}/api/mercadopago/webhook` con firma válida

## Flujo seña (30%)

1. Ir a `/servicios/coworking/reservar/[spaceId]`
2. Elegir día/hora, marcar **“Dejar seña del 30%”**
3. Completar checkout MP por el monto de seña
4. Esperar webhook → `bookings.estado='senada'`, `monto_pagado` ≈ 30% del total
5. En `/servicios/coworking/reservas/[id]` usar **Pagar saldo restante**
6. Completar segundo checkout → webhook → `estado='confirmada'`, `monto_pagado` ≈ total
7. Verificar QR disponible y fila(s) en `payments` (2 filas `aprobado`)

## Flujo pago completo (control)

1. Misma reserva **sin** checkbox de seña
2. Un solo pago → `confirmada` directo

## Abandono

1. Crear reserva pendiente y **no** pagar
2. Esperar >10 min + disparar `POST /api/cron/coworking`
3. Esperado: `bookings.estado='cancelada'`, slot libre en grilla

## Checklist de evidencia

- [ ] Preferencia creada (init_point)
- [ ] Firma x-signature OK (401 si se altera)
- [ ] Seña → senada
- [ ] Saldo → confirmada
- [ ] Liberación 10 min
