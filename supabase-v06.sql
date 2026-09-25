-- Llega Hoy: migrar configuración de prueba a la tienda REAL 2484130.
-- Seguro para repetir: no sobreescribe la configuración si ya existe.
insert into public.store_settings
  (store_id, enabled, cutoff_time, timezone, delivery_days, blocked_dates, badge_text, settings)
select '2484130', false, cutoff_time, timezone, delivery_days, blocked_dates, badge_text, settings
from public.store_settings
where store_id = 'llama-maestra-test'
on conflict (store_id) do nothing;

-- Comprobar resultado (no compartir claves de API):
select store_id, enabled, cutoff_time, badge_text, delivery_days
from public.store_settings
where store_id in ('llama-maestra-test','2484130');
