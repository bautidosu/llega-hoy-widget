# Llega Hoy — Contadores manuales de ventas (módulo independiente)

- No se modificó `public/widget.js`, `lib/delivery.mjs`, ni las rutas del widget.
- Solo importa catálogo de tienda `2484130` (Llama Maestra), y conserva los números al reimportar.
- No consulta órdenes ni calcula ventas. Solo publica los números ingresados manualmente.
- Desactivado por defecto en cada producto. No se envía ningún email.

## Instalación
1. En Supabase SQL Editor, ejecutar `supabase-sold-counts.sql`.
2. Desplegar el proyecto actualizado en Vercel con las variables existentes.
3. Iniciar sesión en el panel de Llega Hoy y abrir `/sold-counts`.
4. Hacer clic en «Importar / actualizar catálogo», ingresar vendidos, marcar «Mostrar» y guardar cada producto.
5. SOLO después de validar el HTML real de la grilla en un entorno de prueba, agregar un script adicional en Tiendanube, **sin reemplazar el script actual**:

```html
<script defer src="https://TU-DOMINIO-VERCEL/sold-counts.js"></script>
```

Reemplazar `TU-DOMINIO-VERCEL` por el dominio real de la aplicación. Si se sirve desde un dominio distinto, la API se deduce de la URL del script. **No instalar el script en producción antes de probar los selectores del tema.**

## Detalles
- El script busca tarjetas con `[data-store="product-item"]`, `.js-item-product`, `.item-product`, `.product-item`.
- Busca precio y badge de entrega mediante selectores comunes. Si no identifica la tarjeta o el punto de inserción, no inserta nada (fail-closed).
- La ubicación «encima de Llega mañana» depende del HTML real del tema: inspeccionar en Tiendanube antes de habilitarlo en producción.
- API pública: `/api/public/sold-counts`, sin datos personales; cache 5 minutos. Si la API falla, no muestra contadores.
- Escalones conservadores: 10, 25, 50, 100, 250, 500, 1.000, 2.500, 5.000, 10.000, etc.
- La importación necesita permisos de lectura de productos en el token actual. No se agregan permisos ni se reinstala la app automáticamente.
