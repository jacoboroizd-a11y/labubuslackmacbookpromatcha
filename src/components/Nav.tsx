"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clapperboard,
  Compass,
  Home,
  Bookmark,
  UserRound,
  Search,
  Settings,
  Film,
  Tv,
} from "lucide-react";
export function Nav({
  region,
  signedIn,
}: {
  region: string;
  signedIn: boolean;
}) {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Inicio", Icon: Home },
    { href: "/discover", label: "Descubrir", Icon: Compass },
    { href: "/movies", label: "Películas", Icon: Film },
    { href: "/tv", label: "Series", Icon: Tv },
    { href: "/watchlist", label: "Mi lista", Icon: Bookmark },
  ];
  return (
    <>
      <header className="header">
        <Link className="brand" href="/">
          <Clapperboard size={27} />
          <span>
            frame<span className="brand-dot">.</span>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Principal">
          {links.map(({ href, label }) => (
            <Link
              className={pathname === href ? "active" : ""}
              key={href}
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-tools">
          <Link href="/discover" aria-label="Buscar">
            <Search size={20} />
          </Link>
          <Link className="region" href="/settings">
            {region}
          </Link>
          <Link href="/settings" aria-label="Configuración">
            <Settings size={19} />
          </Link>
          <Link
            className="avatar"
            href={signedIn ? "/profile" : "/auth"}
            aria-label={signedIn ? "Mi perfil" : "Iniciar sesión"}
          >
            <UserRound size={19} />
          </Link>
        </div>
      </header>
      <nav className="mobile-nav" aria-label="Principal móvil">
        {[
          links[0],
          links[1],
          { href: "/discover?focus=search", label: "Buscar", Icon: Search },
          links[4],
          { href: "/profile", label: "Perfil", Icon: UserRound },
        ].map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? "active" : ""}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
