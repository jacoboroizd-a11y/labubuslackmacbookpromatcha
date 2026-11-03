import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Play,
  Plus,
  SlidersHorizontal,
  Globe,
  Check,
  Search,
  Film,
} from "lucide-react";
import { context } from "@/services/userMedia";
import { catalog, regionalize, tmdbConfigured } from "@/services/tmdb";
import { SERVICES, included } from "@/services/providers";
import { Catalog } from "@/components/Catalog";
import { SetupNotice } from "@/components/Notice";
import { titleOf, mediaKey, type Media } from "@/lib/types";
export default async function Home() {
  const ctx = await context();
  let items: Media[] = [];
  let error = false;
  if (tmdbConfigured()) {
    try {
      items = await catalog("movie", ctx.profile.region);
    } catch {
      error = true;
    }
  }
  const availability = await regionalize(items, ctx.profile.region);
  const visible = items.filter(
    (m) =>
      !ctx.profile.included_only ||
      included(availability.get(mediaKey(m)), ctx.active).length,
  );
  const hero = visible.find((m) => m.backdrop_path);
  const activeServices = SERVICES.filter((s) => ctx.active.includes(s.id));
  return (
    <main>
      <section className={`hero ${hero ? "has-backdrop" : ""}`}>
        {hero?.backdrop_path ? (
          <Image
            className="hero-image"
            src={`https://image.tmdb.org/t/p/original${hero.backdrop_path}`}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        ) : (
          <div className="cinema-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="planet" />
            <div className="horizon" />
            <span className="art-caption">A WHOLE UNIVERSE. ONE PLACE.</span>
          </div>
        )}
        <div className="hero-shade" />
        <div className="hero-content">
          <div className="eyebrow lime">
            <span className="live-dot" /> TU UNIVERSO DE STREAMING
          </div>
          <p className="hero-kicker">Una noche. Infinitas historias.</p>
          <h1>
            {hero ? (
              titleOf(hero)
            ) : (
              <>
                La próxima historia
                <br />
                te está <em>esperando.</em>
              </>
            )}
          </h1>
          <p className="hero-description">
            {hero?.overview ||
              "Todo lo que te gusta, en un solo lugar. Descubre qué ver con los servicios que ya pagas y haz de cada noche una buena película."}
          </p>
          <div className="hero-actions">
            <Link
              className="button primary"
              href={hero ? `/media/${hero.media_type}/${hero.id}` : "/discover"}
            >
              {hero ? (
                <Play size={17} fill="currentColor" />
              ) : (
                <Search size={18} />
              )}{" "}
              {hero ? "Explorar película" : "Encontrar algo para ver"}
            </Link>
            <Link className="button glass" href="/watchlist">
              <Plus size={19} /> Mi lista
            </Link>
          </div>
          <p className="hero-footnote">
            <Globe size={13} /> Catálogo para {ctx.profile.region}{" "}
            <span>·</span> Tus servicios, tu selección.
          </p>
        </div>
        <div className="hero-index">
          <span className="index-current">01</span>
          <span className="index-line" />
          <span>FRAME ORIGINAL EXPERIENCE</span>
        </div>
      </section>
      <div className="page-content home-content">
        <section className="services-strip">
          <div>
            <span className="eyebrow">EN PRIMERA FILA</span>
            <h2>
              Tus servicios<span className="lime">.</span>
            </h2>
          </div>
          <div className="service-pills">
            {(activeServices.length
              ? activeServices
              : SERVICES.slice(0, 5)
            ).map((s) => (
              <Link
                key={s.id}
                href="/settings"
                className={`service-pill ${ctx.active.includes(s.id) ? "selected" : ""}`}
              >
                <span style={{ color: s.color }}>{s.mark}</span>
                {ctx.active.includes(s.id) && <Check size={12} />}
              </Link>
            ))}
          </div>
          <Link href="/settings" className="manage-link">
            <SlidersHorizontal size={16} />
            {activeServices.length ? "Administrar" : "Elegir mis servicios"}
            <ArrowUpRight size={15} />
          </Link>
        </section>
        {!tmdbConfigured() && <SetupNotice />}
        {error && (
          <div className="message">
            No se pudo conectar con TMDB.{" "}
            <Link href="/">Volver a intentar</Link>
          </div>
        )}
        <section className="catalog-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">DALE PLAY A TU PRÓXIMO PLAN</span>
              <h2>
                {ctx.profile.included_only
                  ? "Incluidas en tus servicios"
                  : "Películas para explorar"}
              </h2>
              <p className="muted">
                {ctx.profile.included_only
                  ? "Sin alquileres. Sin pagar de más."
                  : "Descubre el catálogo y comprueba dónde verlo en tu región."}
              </p>
            </div>
            <Link href="/movies" className="text-link">
              Ver películas <ArrowRight size={16} />
            </Link>
          </div>
          {items.length ? (
            <Catalog
              items={items.slice(0, 12)}
              availability={availability}
              active={ctx.active}
              states={ctx.states}
              includedOnly={ctx.profile.included_only}
            />
          ) : (
            <div className="onboarding-cards">
              <Link href="/settings" className="journey-card">
                <span className="step-number">01 / PERSONALIZA</span>
                <div className="journey-icon">
                  <SlidersHorizontal size={35} />
                </div>
                <h3>
                  Tus plataformas.
                  <br />
                  Tus posibilidades.
                </h3>
                <p>
                  Elige los servicios que pagas. Nosotros ponemos sus títulos
                  primero.
                </p>
                <span className="text-link">
                  Elegir mis servicios <ArrowUpRight size={17} />
                </span>
              </Link>
              <Link href="/discover" className="journey-card purple">
                <span className="step-number">02 / DESCUBRE</span>
                <div className="journey-icon">
                  <Film size={35} />
                </div>
                <h3>
                  Menos scroll.
                  <br />
                  Más cine.
                </h3>
                <p>
                  Busca esa película, serie o actor que no te puedes sacar de la
                  cabeza.
                </p>
                <span className="text-link">
                  Explorar catálogo <ArrowUpRight size={17} />
                </span>
              </Link>
              <Link href="/watchlist" className="journey-card amber">
                <span className="step-number">03 / HAZLA TUYA</span>
                <div className="journey-icon">
                  <Plus size={35} />
                </div>
                <h3>
                  Las buenas historias
                  <br />
                  no se te olvidan.
                </h3>
                <p>
                  Guarda lo que quieres ver y lleva contigo todo lo que ya
                  disfrutaste.
                </p>
                <span className="text-link">
                  Mi biblioteca <ArrowUpRight size={17} />
                </span>
              </Link>
            </div>
          )}
        </section>
        <section className="editorial-banner">
          <div>
            <span className="eyebrow lime">TU TIEMPO ES EL MEJOR PLAN</span>
            <h2>
              Elige la historia.
              <br />
              <span>Nosotros encontramos dónde.</span>
            </h2>
          </div>
          <Link href="/discover" className="button">
            Vamos a descubrir <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </main>
  );
}
