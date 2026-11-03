# Frame — arquitectura

Fase 1 usa Next.js App Router, React, TypeScript y Tailwind. Server Components y acciones de servidor hablan con TMDB y Supabase; el navegador nunca recibe el token TMDB. Supabase Auth administra sesiones por cookies y PostgreSQL protege los datos personales mediante RLS. No se usa service_role.

## Estructura

- `src/app`: rutas, acciones, layout y manifest PWA.
- `src/components`: tarjetas, navegación, formularios y ProviderLauncher.
- `src/services/tmdb`: adaptador server-only, caché HTTP, búsqueda y proveedores regionales.
- `src/services/providers`: clasificación por suscripción y resolución de enlaces oficiales.
- `src/services/userMedia`: preferencias, watchlist y estados personales.
- `src/lib/supabase`: clientes SSR y sesión.
- `supabase/migrations`: esquema versionado con RLS.
- `tests`: reglas de disponibilidad, enlaces y exclusión de vistos.

## Flujo

La región se toma del perfil autenticado, con NI como valor inicial. TMDB devuelve disponibilidad por país: si no devuelve NI, el resultado es desconocido/sin datos para NI, nunca US. Solo `flatrate` de un servicio activo cuenta como incluido. Alquiler, compra, gratis y anuncios se separan. Búsquedas consultan disponibilidad de un conjunto acotado y ordenan primero suscripciones y luego no vistos, conservando relevancia original.

Los proveedores no ofrecen URLs de títulos en TMDB: se usa un enlace directo curado cuando exista; luego búsqueda oficial conocida y por último portada oficial. El botón describe el fallback y no promete reproducción directa. No se infieren deep links. `provider_links` admite enlaces curados para una futura interfaz de administración.

## Caché y fallos

Metadata: 24 horas; catálogo popular: 1 hora; búsqueda: 5 minutos; disponibilidad: 1 hora. TMDB es la caché operativa de lectura en Fase 1 (Next fetch cache), no se afirma ingesta a PostgreSQL. Las tablas de catálogo quedan preparadas para un job de sincronización futuro. Los datos personales son lecturas en vivo de Supabase. Credenciales ausentes producen un estado de configuración explícito. Errores de red producen una pantalla recuperable, sin simular datos.

## Evolución

Fase 2: progreso episódico, colecciones y motor explicable. Fase 3: relaciones curadas y administración con autorización de rol. Fase 4: discovery avanzado, snapshots y notificaciones. No se implementa administración abierta. Un futuro API móvil puede reutilizar adaptadores y reglas puras. Las sesiones actuales son web y multiusuario desde el inicio.

## PWA

Manifest, icono y service worker permiten instalar el shell. El worker solo cachea el documento offline estático; nunca sesiones, APIs ni respuestas personales. Consulta de catálogo y escrituras requieren conexión.
