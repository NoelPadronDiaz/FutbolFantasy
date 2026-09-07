# FutbolFantasy

Aplicación en Angular para controlar mis fichajes del Fantasy de La Liga: jugadores en plantilla, histórico de ventas y balance de ganancias/pérdidas.

## Funcionalidades

- **Plantilla**: alta de fichajes (nombre, posición, equipo real, precio y fecha de compra) y venta de jugadores.
- **Histórico**: jugadores vendidos, con precio de compra/venta y resultado, con opción de recuperar un jugador a la plantilla activa.
- **Balance**: balance neto de las compraventas, dinero invertido/recibido, y ranking de jugadores por ganancia/pérdida.

## Arquitectura

- **Frontend**: Angular (standalone components + signals), en `src/`.
- **Backend**: funciones serverless de Vercel en `api/` (una por endpoint), que hablan con Postgres a través de `@neondatabase/serverless`.
- **Base de datos**: Postgres en [Neon](https://neon.tech), provisionada desde la integración de Vercel (una única tabla `players`, ver `sql/schema.sql`).

Angular no puede conectarse directamente a Postgres desde el navegador, así que todo el acceso a datos pasa por `api/players/index.ts` (listar/crear vía GET/POST, y vender/recuperar/editar/eliminar vía PATCH/DELETE con `?id=`).

## Configuración inicial

1. Copia las variables de entorno de tu proyecto de Vercel (Storage → tu base de datos → `.env.local`) a un archivo `.env` en la raíz. Como mínimo necesitas `DATABASE_URL`. **Nunca subas `.env` al repositorio** (ya está en `.gitignore`).
2. Instala dependencias:
   ```bash
   pnpm install
   ```
3. Crea la tabla `players` en tu base de Neon (solo hace falta una vez; es idempotente):
   ```bash
   pnpm migrate
   ```

## Desarrollo local

Angular (`ng serve`) no puede ejecutar las funciones de `api/` por sí solo; hace falta `vercel dev` en paralelo, que sí las ejecuta y las conecta a Neon.

1. Vincula el proyecto a Vercel (una sola vez):
   ```bash
   npx vercel login
   npx vercel link
   ```
2. En una terminal, levanta las funciones serverless (puerto 3000 por defecto):
   ```bash
   npx vercel dev
   ```
3. En otra terminal, levanta Angular (puerto 4200), que reenvía `/api/*` al puerto 3000 gracias a `proxy.conf.json`:
   ```bash
   pnpm start
   ```
4. Abre `http://localhost:4200/`.

## Tests

```bash
pnpm exec ng test --watch=false
```

## Build

```bash
pnpm build
```

## Despliegue

Al desplegar en Vercel (`vercel deploy` o mediante un push con la integración de Git activada), configura `DATABASE_URL` como variable de entorno del proyecto en Vercel — si la base de datos se creó desde la integración de Vercel Postgres/Neon, ya estará configurada automáticamente. Vercel construye el frontend Angular y despliega las funciones de `api/` en el mismo dominio, así que no hace falta configurar CORS ni URLs separadas.
