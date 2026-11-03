import Link from "next/link";
import { context } from "@/services/userMedia";
import { detail, regionalize, tmdbConfigured } from "@/services/tmdb";
import { included } from "@/services/providers";
import { Catalog } from "@/components/Catalog";
import { Empty, SetupNotice } from "@/components/Notice";
import { mediaKey, type Media } from "@/lib/types";
export const metadata = { title: "Mi lista" };
export default async function Watchlist({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  const ctx = await context();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const start = (page - 1) * 20;
  const rows = ctx.watchlist.slice(start, start + 20);
  const results = tmdbConfigured()
    ? await Promise.allSettled(rows.map((s) => detail(s.media_type, s.tmdb_id)))
    : [];
  const items = results
    .filter((r): r is PromiseFulfilledResult<Media> => r.status === "fulfilled")
    .map((r) => r.value);
  const availability = await regionalize(items, ctx.profile.region);
  if (params.sort === "rating")
    items.sort((a, b) => b.vote_average - a.vote_average);
  if (params.sort === "year")
    items.sort((a, b) =>
      (b.release_date || b.first_air_date || "").localeCompare(
        a.release_date || a.first_air_date || "",
      ),
    );
  if (params.sort === "runtime")
    items.sort(
      (a, b) =>
        (a.runtime || a.episode_run_time?.[0] || Infinity) -
        (b.runtime || b.episode_run_time?.[0] || Infinity),
    );
  const now = items.filter(
    (m) => included(availability.get(mediaKey(m)), ctx.active).length,
  ).length;
  return (
    <main className="page-content inner-page">
      <div className="page-heading">
        <span className="eyebrow lime">GUARDADAS PARA UN BUEN MOMENTO</span>
        <h1>Tu lista de próximas historias.</h1>
        <p>
          {ctx.watchlist.length} títulos guardados
          {now ? ` · ${now} de esta página incluidos en tus servicios` : ""}
        </p>
      </div>
      {!ctx.user ? (
        <Empty
          title="Tu lista empieza contigo"
          description="Inicia sesión para guardar títulos y encontrarlos en cualquiera de tus dispositivos."
        />
      ) : !tmdbConfigured() ? (
        <SetupNotice />
      ) : !ctx.watchlist.length ? (
        <Empty
          title="Deja espacio para una buena historia"
          description="Busca un título y pulsa Agregar a mi lista. Tus favoritas te esperarán aquí."
        />
      ) : (
        <>
          <form className="filter-bar">
            <label>
              Ordenar esta página
              <select name="sort" defaultValue={params.sort || "recent"}>
                <option value="recent">Recientes</option>
                <option value="rating">Rating TMDB</option>
                <option value="year">Año</option>
                <option value="runtime">Duración</option>
              </select>
            </label>
            <button type="submit" className="button small">
              Ordenar
            </button>
          </form>
          {results.some((r) => r.status === "rejected") && (
            <p role="status" className="message">
              Algunos títulos no pudieron cargarse. Tu lista sigue guardada;
              vuelve a intentar más tarde.
            </p>
          )}
          <Catalog
            items={items}
            availability={availability}
            active={ctx.active}
            states={ctx.states}
            includedOnly={ctx.profile.included_only}
          />
          <div className="pagination">
            {page > 1 && (
              <Link className="button" href={`/watchlist?page=${page - 1}`}>
                Anterior
              </Link>
            )}
            {start + 20 < ctx.watchlist.length && (
              <Link className="button" href={`/watchlist?page=${page + 1}`}>
                Siguiente
              </Link>
            )}
          </div>
        </>
      )}
      <Link className="button primary" href={ctx.user ? "/discover" : "/auth"}>
        {ctx.user ? "Descubrir más títulos" : "Iniciar sesión"}
      </Link>
    </main>
  );
}
