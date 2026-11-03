# Frame

Tu biblioteca personal de streaming. Descubre qué puedes ver con las suscripciones que ya pagas, busca películas/series/personas y guarda tu historial. Región inicial: Nicaragua (NI). No reproduce contenido: abre plataformas oficiales.

## Desarrollo

Node.js 24 y npm 11 (validados en cloud).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

1. Crear un proyecto Supabase. Ejecutar `supabase/migrations/001_initial.sql` en SQL Editor.
2. Copiar Project URL y Publishable Key a las variables públicas de `.env.local`. Nunca usar service_role.
3. En Auth > URL Configuration configurar Site URL y permitir `/auth/callback` y `/auth/reset` bajo la URL del despliegue. Para desarrollo, usar el origen local de Next. Email confirmations pueden permanecer activas. Configurar SMTP antes de producción.
4. Crear cuenta e iniciar sesión en `/auth`. El correo de confirmación vuelve a `/auth/callback`. Recuperación vuelve a `/auth/reset`.
5. En TMDB, crear una cuenta, solicitar acceso API en Settings > API y copiar **API Read Access Token** a `TMDB_READ_ACCESS_TOKEN`. Es un bearer token server-only, no la API key v3.
6. Elegir región y suscripciones en `/settings`.

Sin credenciales se ve el diseño y una indicación de configuración; no hay disponibilidad inventada ni persistencia simulada. Sin TMDB no se puede validar catálogo real. Sin Supabase no se puede validar autenticación ni guardar datos.

```sh
npm run typecheck
npm test
npm run build
npm start
```

Se usa un lockfile npm. Next instala el shell PWA con manifest e icono; el modo offline muestra una página informativa, no datos personales cacheados. HTTPS es necesario en producción.

Ver [ARCHITECTURE.md](ARCHITECTURE.md), [DATABASE.md](DATABASE.md), [PROVIDERS.md](PROVIDERS.md) y [ROADMAP.md](ROADMAP.md). Fases 2–4 están diseñadas pero pendientes. Antes de publicar validar auth, RLS entre dos usuarios y disponibilidad NI con credenciales reales. No agregar secretos al repositorio.

## Estado de validación

Consulta [VALIDATION.md](VALIDATION.md) para ver las pruebas ejecutadas y las conexiones externas pendientes. El entorno usa Webpack por las restricciones de workers de Turbopack. En cloud, inicia con `NODE_USE_ENV_PROXY=1 npm run dev` para usar el proxy HTTPS heredado con Node 24.
