# Llega Hoy v0.6 — vinculación tienda real y branding

## Estado
OAuth vinculado: tienda 2484130. Esta actualización conserva el administrador y las API existentes.

## 1. Supabase
Ejecutar `supabase-v06.sql` en SQL Editor. Si la instalación ya copió la configuración, no la pisa.

## 2. Vercel
Editar variable de entorno `LH_STORE_ID` a `2484130` en Production. **No cambiar** `TN_CLIENT_ID`, `TN_CLIENT_SECRET`, `TN_TOKEN_ENCRYPTION_KEY` ni las claves de Supabase. Redeploy.

## 3. Administrador
Entrar, comprobar horarios, días, badge y colores, activar «Publicar widget» y Guardar. Consultar `/api/widget-config`: debe mostrar `enabled:true` y colores guardados. Si no hay fila para `2484130`, ejecutar el SQL y guardar de nuevo.

## 4. Integración NubeSDK (pendiente de compilar y registrar)
No registrar `public/widget.js` como `Uses Nube SDK`: es un script clásico solo para pruebas aisladas. Para publicar de forma oficial hay que crear un bundle SDK, registrarlo como script de la aplicación y comprobar el slot `before_product_detail_add_to_cart` en el tema Río. Ver docs oficiales: https://dev.tiendanube.com/docs/applications/nube-sdk/slots/overview

## 5. Reglas
Sin verificación de código postal. Solo horario y calendario Argentina; badge CABA/GBA. No prometer envío gratis salvo condiciones reales.
