# Llega Hoy v0.5 — OAuth Tiendanube

## Qué incluye
- Callback OAuth `/api/tiendanube/callback`: intercambia el código por token en el servidor y obtiene el ID real de la tienda.
- Guarda el token **cifrado AES-256-GCM** en `tn_installations`, con RLS y sin acceso público.
- Copia la configuración de prueba a la nueva tienda si no existe, **desactivada** para evitar publicar sin querer.
- API de estado `/api/tiendanube/status`, disponible solo después de iniciar sesión en el administrador; **nunca devuelve tokens**.

## Antes de instalar
1. Ejecutá `supabase-v05.sql` en SQL Editor de tu proyecto Supabase.
2. En Vercel > Settings > Environment Variables agregá en Production: `TN_CLIENT_ID`, `TN_CLIENT_SECRET` y `TN_TOKEN_ENCRYPTION_KEY`. Conservá las variables de v0.4. El Client ID es el ID de la aplicación de Tiendanube; el Client Secret se copia del Portal de Partners y NO se comparte.
3. Generá una clave de cifrado aleatoria con PowerShell: `[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))`. Pegá el resultado como `TN_TOKEN_ENCRYPTION_KEY` en Vercel; guardalo en un gestor de contraseñas. No lo cambies sin migrar los tokens cifrados.
4. En Portal de Partners: Página de la aplicación `https://TU-DOMINIO/`; URL para redirigir después de la instalación `https://TU-DOMINIO/api/tiendanube/callback`.
5. Copiá el contenido de este ZIP **dentro** de tu carpeta local del proyecto (no copies `.git` ni crees una carpeta extra); `npm install`, `npm run build`, `npm test`, `git add -A`, `git commit -m "Llega Hoy v0.5 OAuth Tiendanube"`, `git push origin main`.
6. Esperá el despliegue nuevo en Vercel y recién entonces instalá la app en Llama Maestra desde Partners. El callback debe llevarte al panel con `?tn_installed=ID_REAL`. Entrá al panel y comprobá `https://TU-DOMINIO/api/tiendanube/status` después de iniciar sesión: debe listar la instalación y mostrar el ID real.
7. Para que el panel de la v0.4 administre esa tienda real, cambiá `LH_STORE_ID` en Vercel al ID recibido y hacé Redeploy. La configuración de prueba se copia desactivada; activala y guardala desde el panel después de revisar los colores y el horario.

## IMPORTANTE
- Esta v0.5 implementa **OAuth, no instala todavía el script NubeSDK**. No registres `public/widget.js` como NubeSDK: ese archivo usa DOM y no funciona en el Web Worker de NubeSDK. La adaptación del storefront va en la siguiente versión.
- El callback es el punto de entrada del flujo iniciado por Tiendanube; el código de autorización es de un solo uso y dura pocos minutos.
- No se verifica código postal: solo horario y días habilitados. La tienda/correo valida la cobertura.
- Para otros comerciantes hará falta implementar autenticación multiusuario en el panel; el login actual con contraseña es únicamente para la etapa inicial de Llama Maestra.
- No expongas las variables privadas ni subas `.env.local`.
