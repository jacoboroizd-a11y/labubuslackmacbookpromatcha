# Proveedores y disponibilidad

TMDB Watch Providers usa datos de JustWatch. Mostrar atribución a TMDB y JustWatch; revisar sus términos y obtener los permisos necesarios antes de un lanzamiento comercial. Este producto no está avalado ni certificado por TMDB.

Solo `flatrate` de un proveedor activo en la región del perfil significa «Incluido en tus servicios». No se confunden Prime Video, Amazon Video o Channels. No se convierte una ausencia de datos de NI en una disponibilidad de US. Los datos pueden cambiar: la plataforma oficial confirma acceso y precio.

`ProviderLauncher` utiliza únicamente enlaces HTTPS oficiales conocidos o curados con validación de hostname. Sin URL del título, indica «Buscar en…» o «Abrir…». Los enlaces universales HTTPS pueden abrir la app oficial si el dispositivo/proveedor lo admite. No se inventan esquemas ni se detecta una instalación con trucos. La app no pide credenciales de streaming y no reproduce ni descarga contenido.

Para nuevas fuentes implementar un adaptador que devuelva `Availability` conservando región, monetización y procedencia. Para JustWatch Partner API hace falta un acuerdo: no se scraping ni se usan endpoints privados.
