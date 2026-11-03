import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Pwa } from "@/components/Pwa";
import { context } from "@/services/userMedia";
export const metadata: Metadata = {
  title: {
    default: "Frame — Tu universo de streaming",
    template: "%s · Frame",
  },
  description:
    "Descubre qué ver con los servicios que ya pagas. Tu biblioteca de películas y series, desde Nicaragua.",
  applicationName: "Frame",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = {
  themeColor: "#101214",
  width: "device-width",
  initialScale: 1,
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await context();
  return (
    <html lang="es">
      <body>
        <Nav region={ctx.profile.region} signedIn={!!ctx.user} />
        {children}
        <footer>
          <span className="brand footer-brand">
            frame<span className="brand-dot">.</span>
          </span>
          <p>Menos buscar. Más disfrutar.</p>
          <div>
            Metadata: TMDB · Disponibilidad: JustWatch vía TMDB.
            <br />
            Este producto no está avalado ni certificado por TMDB.
          </div>
        </footer>
        <Pwa />
      </body>
    </html>
  );
}
