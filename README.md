# FutbolFantasy

Aplicación en Angular para controlar los fichajes del Fantasy de La Liga: jugadores en plantilla, histórico de ventas y balance de ganancias/pérdidas. Multiusuario: cada cuenta ve únicamente su propia plantilla.

## Funcionalidades

- **Cuentas**: registro e inicio de sesión con email + contraseña; cada usuario tiene su plantilla, histórico y balance independientes.
- **Plantilla**: alta de fichajes (nombre, posición, equipo real, precio y fecha de compra) y venta de jugadores.
- **Histórico**: jugadores vendidos, con precio de compra/venta y resultado, con opción de recuperar un jugador a la plantilla activa.
- **Balance**: balance neto de las compraventas, dinero invertido/recibido, y ranking de jugadores por ganancia/pérdida.

## Arquitectura

- **Frontend**: Angular (standalone components + signals), en `src/`.
- **Backend**: funciones serverless de Vercel en `api/` (una por endpoint), que hablan con Postgres a través de `@neondatabase/serverless`.
- **Base de datos**: Postgres en [Neon](https://neon.tech), provisionada desde la integración de Vercel (tablas `users` y `players`, ver `sql/schema.sql`).
- **Auth**: propia (sin proveedor externo). Contraseñas con `bcryptjs`, sesión como cookie `httpOnly` firmada con `jsonwebtoken` (variable `AUTH_SECRET`). `api/players/index.ts` exige sesión válida y filtra todo por `user_id`.

Angular no puede conectarse directamente a Postgres desde el navegador, así que todo el acceso a datos pasa por `api/players/index.ts` (listar/crear vía GET/POST, y vender/recuperar/editar/eliminar vía PATCH/DELETE con `?id=`) y `api/auth/*` (`register`, `login`, `logout`, `me`).

## Configuración inicial

1. Copia las variables de entorno de tu proyecto de Vercel (Storage → tu base de datos → `.env.local`) a un archivo `.env` en la raíz. Como mínimo necesitas `DATABASE_URL`. **Nunca subas `.env` al repositorio** (ya está en `.gitignore`).
2. Genera un `AUTH_SECRET` (para firmar las cookies de sesión) y añádelo también a `.env`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Instala dependencias:
   ```bash
   pnpm install
   ```
4. Crea las tablas `users`/`players` en tu base de Neon (solo hace falta una vez; es idempotente):
   ```bash
   pnpm migrate
   ```
5. El primer usuario que se registre en la app hereda automáticamente cualquier jugador ya existente sin dueño (`user_id IS NULL`) — pensado para la migración de una plantilla creada antes de tener cuentas.

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

Al desplegar en Vercel (`vercel deploy` o mediante un push con la integración de Git activada), configura `DATABASE_URL` y `AUTH_SECRET` como variables de entorno del proyecto en Vercel (Settings → Environment Variables, para Production/Preview/Development) — `DATABASE_URL` ya estará configurada automáticamente si la base de datos se creó desde la integración de Vercel Postgres/Neon, pero `AUTH_SECRET` hay que añadirla a mano (usa un valor distinto al de tu `.env` local). Vercel construye el frontend Angular y despliega las funciones de `api/` en el mismo dominio, así que no hace falta configurar CORS ni URLs separadas.
