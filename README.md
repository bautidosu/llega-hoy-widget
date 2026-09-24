# Llega Hoy v0.2 — prototipo

Panel Next.js y widget independiente para pruebas. **No está conectado a Tiendanube ni guarda datos en un servidor.**

## Actualizar un proyecto existente
Copiar `app/page.tsx`, `app/styles.css`, `lib/delivery.d.mts` y `public/widget.js` a sus ubicaciones homónimas en el repositorio. No sobrescribir secretos ni configuración propia. Ejecutar `npm install`, `npm test`, `npm run build`, luego `git add -A && git commit -m "Llega Hoy v0.2" && git push origin main`.

## Panel
`npm install && npm run dev`. El botón **Guardar cambios** guarda en `localStorage` del navegador actual. **Exportar JSON** genera un respaldo descargable; no publica cambios en la tienda.

## Widget independiente (solo entorno de pruebas)
En una página HTML de pruebas agregá:

```html
<div data-llega-hoy></div>
<script>
window.LLEGA_HOY_CONFIG = { cutoff:'12:00', days:[1,2,3,4,5,6], badge:'SOLO CABA Y GBA', blockedDates:'', free:false };
</script>
<script src="https://TU-PROYECTO.vercel.app/widget.js" defer></script>
```

`free:true` **solo** cuando esté verificado que el envío en el día es gratuito para ese pedido. La lógica usa la hora del navegador en esta etapa; **no usar para promesas comerciales reales hasta agregar zona horaria Argentina y validación de zona elegible**. No insertar todavía en la tienda en producción.

## Próximos pasos
Persistencia segura por tienda, autenticación OAuth de Tiendanube, integración oficial de storefront, selección de zonas CABA/GBA y manejo de feriados y zona horaria.
