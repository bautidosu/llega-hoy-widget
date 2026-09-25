# Llega Hoy v0.4 — Publicación en la tienda

Esta versión incorpora una API **pública de solo lectura** `/api/widget-config` y `public/widget.js` que consulta Supabase a través del servidor, sin exponer la clave privada. El widget está apagado si el ajuste `enabled` está desactivado o si Supabase no responde.

## Instalación manual inicial

1. Subí esta versión a GitHub y desplegala en Vercel. Conservá las variables SUPABASE_URL, SUPABASE_SECRET_KEY, LH_STORE_ID y ADMIN_PASSWORD.
2. Abrí `https://TU-DOMINIO.vercel.app/api/widget-config`: debe devolver un JSON con `enabled`, `cutoff`, `days`, etc. Nunca debe devolver credenciales.
3. En el administrador de Llega Hoy, activá **Publicar widget** y guardá los cambios.
4. Para un **ensayo temporal**, podés abrir la consola del navegador en una página de producto de Llama Maestra y ejecutar:

   ```js
   const s=document.createElement('script');
   s.src='https://TU-DOMINIO.vercel.app/widget.js';
   s.dataset.api='https://TU-DOMINIO.vercel.app/api/widget-config';
   document.head.appendChild(s);
   ```

   Esto solo muestra el widget en tu navegador actual; no lo publica para compradores. Comprobá la ubicación visual y el comportamiento en la página del producto, especialmente en productos con selector de combos.
5. Para mostrarlo a todos los compradores, incorporá el mismo script por la vía **compatible y autorizada de integración de scripts de Tiendanube** para tu tienda/tema. Verificá el mecanismo disponible en tu panel o en la documentación oficial. No pegues scripts en campos de contenido que los filtren.

   ```html
   <script src="https://TU-DOMINIO.vercel.app/widget.js" data-api="https://TU-DOMINIO.vercel.app/api/widget-config" defer></script>
   ```

6. En la tienda, verificá desde CABA/GBA que el servicio de entrega en el día efectivamente se ofrece a los códigos postales elegibles antes de activar la promesa. El badge no detecta ubicación ni código postal. Desactivá la opción `free` salvo que el envío **en el día** sea gratis para todos los productos en que aparece.

## Seguridad y operaciones

- La API pública solo expone configuración visual y logística, no la contraseña ni la clave de Supabase.
- La API pública tiene caché de hasta 30 segundos; los cambios pueden tardar aproximadamente 30–60 segundos en aparecer.
- El widget usa `America/Argentina/Buenos_Aires` independientemente de la ubicación del comprador.
- Los días sin reparto y las fechas excluidas se respetan; al pasar el corte se actualiza automáticamente.
- Para apagarlo en toda la tienda, desactivá `Publicar widget` y guardá; la caché puede demorar brevemente. Para retirarlo inmediatamente, quitá el script de Tiendanube.
- Esta versión es integración de script manual, **no** una app aprobada del marketplace ni OAuth Tiendanube. Para comercializarla, implementar el mecanismo oficial vigente.
