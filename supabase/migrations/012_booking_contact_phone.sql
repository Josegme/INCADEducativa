-- ============================================================
-- INCADEducativa — Migración 012: Teléfono de contacto en reservas (ETAPA 2)
-- Sprint 13-14: la confirmación por WhatsApp (Addendum 03 §3 paso 7) necesita
-- un número al que enviar — public.users no tiene columna de teléfono (no se
-- capturó en ningún flujo hasta ahora, ni CSV ni auth). En vez de sumar un
-- campo de teléfono al perfil general (fuera de alcance de este sprint), se
-- agrega opcionalmente a la reserva misma: quien reserva puede dejarlo si
-- quiere la confirmación por WhatsApp además del email (que sí siempre tiene,
-- es la cuenta con la que se registró/logueó).
-- Depende de: 002_coworking_module.sql ya aplicada.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

alter table public.bookings add column telefono_contacto text;
