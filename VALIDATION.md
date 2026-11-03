# Validación de Fase 1

## Ejecutado en el entorno cloud

- `npm test`: 16 pruebas en 3 archivos. Disponibilidad por suscripción, exclusión de vistos/no interesados, enlaces HTTPS oficiales, fixtures aislados de TMDB y migración/RLS de PostgreSQL con PGlite.
- `npm run typecheck`: correcto.
- `npm run build`: build de producción con Webpack. Turbopack no pudo crear el puerto de su worker en este entorno; no se desactivaron validaciones del compilador.
- Chromium real, sin credenciales: 12 rutas de escritorio y 6 móviles (390 px), navegación al buscador, envío de búsqueda, ausencia de overflow horizontal y errores JavaScript, pantalla not-found, manifest y fallback offline del service worker.

Los fixtures de TMDB solo existen en tests; la aplicación no los presenta como catálogo real. El test de base de datos crea roles y contexto de identidad de prueba; comprueba trigger de perfil, región NI, aislamiento entre dos usuarios, restricciones de estado y acceso anónimo. No reemplaza la comprobación de un proyecto Supabase real.

## Requiere configuración externa

No había variables TMDB/Supabase en la máquina. Quedan por validar con servicios reales: registro/confirmación/login/recuperación, persistencia, metadata, disponibilidad regional NI y enlaces de títulos curados. Aplicar la migración una sola vez en un proyecto nuevo y configurar variables y URLs de Auth siguiendo README.md.

No se desplegó, publicó ni empujó el repositorio a GitHub. Los commits son locales a la rama de trabajo. Los campos install_script/start_skill y requisitos de conexión se guardaron en el borrador del entorno; ese guardado no ejecuta scripts ni publica un snapshot.
