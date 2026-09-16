# Crons — cableado preview / producción

Rutas protegidas con `Authorization: Bearer ${CRON_SECRET}`:

| Ruta | Qué hace | Cadencia sugerida |
|---|---|---|
| `POST /api/cron/coworking` | no-show, completadas, **libera pendientes >10 min**, recordatorios 24h, resumen 08:00, ociosos lunes 09:00 | cada 10 min |
| `POST /api/cron/tutorias` | recordatorios 24h / 1h + marcar realizadas | cada 10 min |
| `POST /api/cron/nurturing` | emails lead D+1 / D+3 / D+7 | 1×/día |

## Preview (antes de prod)

1. En Vercel Preview, setear `CRON_SECRET` (mismo valor que usará Supabase `pg_net`).
2. Probar a mano:

```bash
curl -X POST "https://<preview>.vercel.app/api/cron/coworking" \
  -H "Authorization: Bearer $CRON_SECRET"
```

3. En Supabase SQL (cuando la preview sea alcanzable por `pg_net`), apuntar el job de la migración 016 a la URL de preview **o** dejar el job pausado hasta Etapa 6 (prod).

## Producción (Etapa 6 — juntos)

- `NEXT_PUBLIC_APP_URL=https://incadeducativa.com`
- Actualizar URL en `pg_net` / cron jobs a `https://incadeducativa.com/api/cron/...`
- Rotar `CRON_SECRET` si estuvo expuesto en preview logs

## Liberación de slot (10 min)

Desde go-live Etapa 1, `/api/cron/coworking` cancela `bookings.estado='pendiente'` con `created_at` > 10 min y marca `payments` asociados `pendiente` → `rechazado`. Así el exclude `no_overlap` libera el horario.
