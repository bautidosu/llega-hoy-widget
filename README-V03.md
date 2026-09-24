# Llega Hoy v0.3 — Supabase y acceso privado

Basado en el ZIP que subiste. Sustituí **app/** y **lib/** completos y agregá **.env.example** a tu proyecto existente. Conservá `public/widget.js` (todavía manual, no instalado en Tiendanube).

## Variables en Vercel
- `SUPABASE_URL`: URL del proyecto.
- `SUPABASE_SECRET_KEY`: clave secreta Supabase (`sb_secret_...` o `service_role` heredada). Solo servidor.
- `ADMIN_PASSWORD`: contraseña larga y exclusiva (mínimo 16 caracteres). No es la contraseña de Supabase.
- `LH_STORE_ID`: `llama-maestra-test` para el piloto. Más adelante se sustituirá por el identificador verificado de la tienda en OAuth Tiendanube.

Para desarrollo local, creá `.env.local` (ignorado por Git) con los mismos valores. No subas secretos.

## Despliegue
`npm install && npm run build && npm test`, después `git add -A`, `git commit -m "Llega Hoy v0.3 - Supabase y login"`, `git push origin main`. Verificá que Vercel tenga Root Directory vacío.

## Seguridad y límites
- Panel protegido con contraseña única de piloto, cookie HttpOnly firmada de 7 días y comprobación de origen para escrituras. No es aún login multi-comercio ni OAuth. No compartas la contraseña.
- Supabase solo se consulta desde el servidor. RLS permanece activada sin políticas públicas.
- La API pública `/api/public/config` devuelve solo `enabled:false` hasta que actives el widget, y no revela credenciales.
- El widget actual en `public/widget.js` sigue siendo un prototipo manual; **no** se instala ni sincroniza automáticamente en Tiendanube.
- No actives la opción `free` hasta validar que envío en el día sea realmente gratis para los pedidos correspondientes.
- La hora del navegador sigue rigiendo la vista previa; la integración real requerirá zona horaria de la tienda, condiciones geográficas y OAuth.
