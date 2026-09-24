# Llega Hoy — prototipo 0.1

Primer prototipo independiente del widget de entregas en el día para CABA/GBA. Incluye panel de configuración **solo en memoria**, vista previa responsive, días habilitados, horario de corte, fechas bloqueadas, badge flotante, colores, cuenta regresiva con segundos en la última hora y estado de mañana/próxima fecha. Es código original; no incluye código de Wiggy.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir http://localhost:3000. Pruebas: `npm test`. Compilar: `npm run build`.

## Vercel

1. Crear repositorio GitHub y subir los archivos de esta carpeta.
2. Vercel > Add New > Project > importar el repositorio.
3. Framework: Next.js. Deploy. No se requieren variables de entorno **para esta demo**.
4. La URL de Vercel sirve para mostrar el panel de prueba, **no** implica que el widget esté instalado en Tiendanube.

## Pendiente para integración real

- Crear app independiente en Portal de Socios y confirmar mecanismo oficial de storefront compatible con Río/NubeSDK.
- Implementar OAuth y callbacks de instalación y desinstalación; guardar tokens exclusivamente en backend.
- Base de datos por tienda, autenticación del administrador y guardado de configuración.
- Widget frontend liviano distribuido por la integración oficial; evitar doble inserción con Wiggy.
- Zona horaria por tienda (`America/Argentina/Buenos_Aires` para Llama Maestra), feriados por año, reglas de zonas y validación de la promesa de entrega.
- Validar condiciones de envío gratis a nivel de carrito; por ahora el interruptor es **solo demostrativo**.
- Pruebas de mobile, variantes, carrito, cortes de día y días no laborables antes de habilitarlo en producción.

**No usar la demo como una promesa de entrega real en la tienda hasta completar las validaciones.**
