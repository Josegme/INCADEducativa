# Go-live producción — sesión conjunta (Etapa 6)

**No ejecutar en solitario.** Token MercadoPago + deploy prod = sesión vos + agente.

## Precondiciones

- [ ] Etapas 1–5 OK en preview
- [ ] Soft-launch checklist firmado (`docs/qa/soft-launch-checklist.md`)
- [ ] Runbook pública leído (`docs/qa/feature-publica-runbook.md`)
- [ ] E2E coworking verde / smoke manual verde

## 6.1 Env production (Vercel)

| Variable | Nota |
|---|---|
| `MP_ACCESS_TOKEN` | Producción o sandbox según acuerdo |
| Webhook secret / firma MP | Verificar `x-signature` |
| `SUPABASE_SERVICE_ROLE_KEY` | Rotar si hubo exposición |
| `CRON_SECRET` | Mismo que usa `pg_net` |
| `NEXT_PUBLIC_APP_URL` | `https://incadeducativa.com` |
| `NEXT_PUBLIC_ADMISIONES_WHATSAPP` | Número internacional sin `+` (CTA carreras) |
| Resend / Sentry | Confirmar |

## 6.2 Apuntar externos a prod

- Webhook MP → `https://incadeducativa.com/api/mercadopago/webhook`
- `pg_net` / crons → dominio prod + `Authorization: Bearer $CRON_SECRET`
  - `/api/cron/coworking`, `/api/cron/tutorias`, `/api/cron/nurturing`
- Seña → saldo: seguir `docs/qa/runbook-sena-mp.md`

## 6.3 Deploy

- Merge a `main` / promote preview → production
- Verificar build verde + health check home

## 6.4 Pagos reales acotados (montos mínimos)

1. 1 reserva coworking (seña + saldo o crédito)
2. 1 curso pago
3. 1 suscripción catálogo

## 6.5 Flags

1. Soft launch: E2 on, `publica` **off** → 24–48h
2. Luego `publica` on si corresponde (`/admin/configuracion`)

## 6.6 Monitoreo

- Sentry: sin errores nuevos post-deploy
- Vercel Analytics: pageviews llegando
- Rollback: flag off y/o redeploy revision previa

## Firma sesión conjunta

| | Nombre | Fecha |
|---|---|---|
| Ops | | |
| Técnico | | |
