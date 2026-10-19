# Práctica Abierta — Inscripciones y pagos

Proyecto nuevo, sin registros existentes. Next.js 15 + Supabase + Mercado Pago Checkout Pro. Diseño responsive con el afiche original como encabezado. Tres fechas de 2026, importe fijo ARS 10.000 y administrador protegido con contraseña, agrupado por fecha y exportación CSV.

## 1. Requisitos
- Node.js 20 o superior.
- Cuenta Supabase y aplicación Mercado Pago.
- GitHub y Vercel para publicar.

## 2. Base de datos
1. Crear proyecto en https://supabase.com/dashboard.
2. SQL Editor → pegar y ejecutar `supabase/schema.sql`.
3. Project Settings → API: copiar Project URL y `service_role` key (¡secreta!).

## 3. Configuración local
1. Copiar `.env.example` a `.env.local`.
2. Completar todas las variables. `APP_URL=http://localhost:3000` en local.
3. Para probar pagos usar token de **prueba** `TEST-...`, no `APP_USR-...`.
4. Generar un `ADMIN_SESSION_SECRET` aleatorio de 32 caracteres o más, por ejemplo con `openssl rand -hex 32`.
5. Ejecutar `npm install` y `npm run dev`. Abrir http://localhost:3000 y http://localhost:3000/admin.

## 4. Vercel
1. Subir a GitHub solo el código; `.gitignore` excluye `node_modules`, `.next` y `.env.local`.
2. Importar repositorio en https://vercel.com/new.
3. Settings → Environment Variables: configurar `APP_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.
4. `APP_URL` debe ser la URL real de producción (por ejemplo `https://practica-abierta.vercel.app`), sin `/` final. Redeploy después de editar variables.
5. En Mercado Pago Developers → Tu integración → Webhooks, configurar `https://TU_DOMINIO/api/webhooks/mercadopago`, seleccionar eventos **Pagos** y copiar la clave secreta en `MERCADOPAGO_WEBHOOK_SECRET`. Redeploy.
6. Verificar con un pago de prueba completo y revisar Supabase y `/admin`.

## 5. Seguridad y funcionamiento
- La inscripción se crea como `pending` y cada una obtiene su propia preferencia de pago.
- El webhook comprueba la firma `x-signature`, consulta el pago a la API de Mercado Pago y valida importe y moneda antes de actualizar el estado.
- La pantalla de retorno **no** marca pagos como aprobados; solo el webhook.
- `/admin` utiliza cookie firmada HttpOnly con expiración de 12 horas.
- Los datos privados solo se leen con `service_role` del servidor; nunca exponer esta clave con `NEXT_PUBLIC_`.
- Si compartiste un token productivo en un chat, regeneralo en Mercado Pago antes de publicar.
- Para pruebas locales del webhook necesitás una URL HTTPS pública (por ejemplo un túnel), ya que Mercado Pago no puede llamar a localhost.
- El límite de 5.000 registros por vista/exportación puede ampliarse con paginación si el evento crece.
- Las fechas están fijadas en **2026**. Para otro año actualizar `lib/config.ts` y la restricción SQL de fechas.
- No incluye emisión automática de recibos ni cupos; estos pueden agregarse posteriormente.

## Estructura
- `app/page.tsx`: formulario
- `app/api/register/route.ts`: registro y Checkout Pro
- `app/api/webhooks/mercadopago/route.ts`: confirmación segura
- `app/admin/page.tsx`: inscriptos por fecha
- `app/api/admin/export/route.ts`: CSV
- `public/header.png`: imagen proporcionada
- `supabase/schema.sql`: tabla nueva
