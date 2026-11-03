import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal } from "lucide-react";
import { context } from "@/services/userMedia";
import { catalog, search, regionalize, tmdbConfigured } from "@/services/tmdb";
import { included } from "@/services/providers";
import { Catalog } from "@/components/Catalog";
import { SetupNotice, Empty } from "@/components/Notice";
import { mediaKey, type Media, type Person, type MediaType } from "@/lib/types";
export const metadata = { title: "Descubrir" };
export default async function Discover({
  searchParams,
  kind,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  kind?: MediaType;
}) {
  const raw = await searchParams;
  const params = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
  const q = (params.q || "").trim().slice(0, 150);
  const ctx = await context();
  const only =
    params.filters === "1"
      ? params.included === "1"
      : params.included === undefined
        ? ctx.profile.included_only
        : params.included === "1";
  const type =
    kind ||
    (params.type === "tv"
      ? "tv"
      : params.type === "movie"
        ? "movie"
        : undefined);
  let items: Media[] = [],
    people: Person[] = [],
    error = false;
  if (tmdbConfigured()) {
    try {
      if (q) {
        const results = await search(q);
        items = results.filter(
          (m): m is Media =>
            m.media_type !== "person" && (!type || m.media_type === type),
        );
        people = type
          ? []
          : results.filter((m): m is Person => m.media_type === "person");
      } else {
        items = await catalog(type || "movie", ctx.profile.region);
      }
    } catch {
      error = true;
    }
  }
  const availability = await regionalize(items, ctx.profile.region);
  const originalOrder = new Map(items.map((m, i) => [mediaKey(m), i]));
  items.sort((a, b) => {
    const ai = included(availability.get(mediaKey(a)), ctx.active).length > 0,
      bi = included(availability.get(mediaKey(b)), ctx.active).length > 0;
    const watched = (m: Media) =>
      ctx.states.some(
        (s) =>
          s.tmdb_id === m.id &&
          s.media_type === m.media_type &&
          s.status === "watched",
      );
    return (
      Number(bi) - Number(ai) ||
      Number(watched(a)) - Number(watched(b)) ||
      originalOrder.get(mediaKey(a))! - originalOrder.get(mediaKey(b))!
    );
  });
  if (params.unwatched === "1")
    items = items.filter(
      (m) =>
        !ctx.states.some(
          (s) =>
            s.tmdb_id === m.id &&
            s.media_type === m.media_type &&
            s.status === "watched",
        ),
    );
  return (
    <main className="page-content inner-page">
      <div className="page-heading">
        <span className="eyebrow lime">SIEMPRE HAY OTRA GRAN HISTORIA</span>
        <h1>
          {kind === "movie"
            ? "Películas"
            : kind === "tv"
              ? "Series"
              : "Descubre tu próxima favorita"}
        </h1>
        <p>
          Un catálogo de posibilidades. Tu selección personal. Región{" "}
          {ctx.profile.region}.
        </p>
      </div>
      <form
        className="search-form"
        action={
          kind === "movie" ? "/movies" : kind === "tv" ? "/tv" : "/discover"
        }
      >
        <div className="search-input">
          <Search size={22} />
          <input
            aria-label="Buscar títulos o personas"
            type="search"
            name="q"
            placeholder="Película, serie, actor, director…"
            defaultValue={q}
            maxLength={150}
          />
          <button className="button primary small" type="submit">
            Buscar
          </button>
        </div>
        <div className="filter-bar">
          <SlidersHorizontal size={17} />
          {!kind && (
            <select
              aria-label="Tipo de contenido"
              name="type"
              defaultValue={type || ""}
            >
              <option value="">Películas y series</option>
              <option value="movie">Películas</option>
              <option value="tv">Series</option>
            </select>
          )}
          <label className="checkbox">
            <input
              type="checkbox"
              name="included"
              value="1"
              defaultChecked={only}
            />{" "}
            Solo mis suscripciones
          </label>
          <input type="hidden" name="filters" value="1" />
          <label className="checkbox">
            <input
              type="checkbox"
              name="unwatched"
              value="1"
              defaultChecked={params.unwatched === "1"}
            />{" "}
            Sin ver
          </label>
          <button className="text-link" type="submit">
            Aplicar filtros
          </button>
        </div>
      </form>
      {!tmdbConfigured() ? (
        <SetupNotice />
      ) : error ? (
        <Empty
          title="El catálogo no está disponible"
          description="TMDB no respondió correctamente. Intenta de nuevo en unos momentos."
        />
      ) : (
        <>
          <div className="section-heading">
            <h2>{q ? `Resultados para “${q}”` : "Explora el catálogo"}</h2>
            <span className="muted">
              Primero tus servicios · Página inicial de TMDB
            </span>
          </div>
          <Catalog
            items={items}
            availability={availability}
            active={ctx.active}
            states={ctx.states}
            includedOnly={only}
          />
          {people.length > 0 && !only && (
            <section className="catalog-section">
              <h2>Personas</h2>
              <div className="people-grid">
                {people.map((p) => (
                  <Link
                    className="person-card"
                    key={p.id}
                    href={`/person/${p.id}`}
                  >
                    {p.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${p.profile_path}`}
                        alt={p.name}
                        width={90}
                        height={90}
                      />
                    ) : (
                      <div className="person-placeholder">{p.name[0]}</div>
                    )}
                    <h3>{p.name}</h3>
                    <p className="muted">{p.known_for_department}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
