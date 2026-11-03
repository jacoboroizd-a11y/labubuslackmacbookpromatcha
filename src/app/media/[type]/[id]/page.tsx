import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Globe, Clock } from "lucide-react";
import { detail, availability, tmdbConfigured } from "@/services/tmdb";
import { context } from "@/services/userMedia";
import { included } from "@/services/providers";
import { ProviderLauncher } from "@/components/ProviderLauncher";
import { MediaControls } from "@/components/MediaControls";
import { SetupNotice, Empty, Message } from "@/components/Notice";
import { supabase } from "@/lib/supabase/server";
import { titleOf, yearOf } from "@/lib/types";
export default async function MediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ message?: string }>;
}) {
  const { type, id } = await params;
  if (
    (type !== "movie" && type !== "tv") ||
    !/^\d+$/.test(id) ||
    Number(id) < 1
  )
    notFound();
  const ctx = await context();
  const { message } = await searchParams;
  if (!tmdbConfigured())
    return (
      <main className="page-content inner-page">
        <SetupNotice />
      </main>
    );
  let media;
  try {
    media = await detail(type, Number(id));
  } catch (e) {
    if (e instanceof Error && e.message === "MEDIA_NOT_FOUND") notFound();
    return (
      <main className="page-content inner-page">
        <Empty
          title="No se pudo cargar este título"
          description="TMDB no está disponible. Vuelve a intentar más tarde."
        />
      </main>
    );
  }
  let a;
  try {
    a = await availability(type, Number(id), ctx.profile.region);
  } catch {
    a = null;
  }
  const mine = a ? included(a, ctx.active) : [];
  const db = await supabase();
  const links = db
    ? (
        await db
          .from("provider_links")
          .select("provider_id,url")
          .eq("tmdb_id", Number(id))
          .eq("media_type", type)
          .eq("region", ctx.profile.region)
      ).data || []
    : [];
  const runtime = media.runtime || media.episode_run_time?.[0];
  const directors =
    type === "tv"
      ? media.created_by || []
      : media.credits?.crew.filter((c) => c.job === "Director") || [];
  return (
    <main>
      <div className="detail-backdrop">
        {media.backdrop_path && (
          <Image
            src={`https://image.tmdb.org/t/p/original${media.backdrop_path}`}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        )}
      </div>
      <div className="page-content detail-content">
        <Link href="/discover" className="text-link">
          <ArrowLeft size={16} /> Volver a explorar
        </Link>
        <Message message={message} />
        <div className="detail-grid">
          <div className="detail-poster">
            {media.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                alt={titleOf(media)}
                width={500}
                height={750}
              />
            ) : (
              <div className="poster-fallback">{titleOf(media)}</div>
            )}
          </div>
          <div>
            <span className="eyebrow lime">
              {type === "movie" ? "PELÍCULA" : "SERIE"} · {yearOf(media)}
            </span>
            <h1>{titleOf(media)}</h1>
            <p className="muted">
              {media.original_title || media.original_name}
            </p>
            <div className="detail-facts">
              <span className="lime">
                <Star size={16} />
                {media.vote_average?.toFixed(1)} TMDB
              </span>
              {runtime && (
                <span>
                  <Clock size={15} />
                  {runtime} min{type === "tv" ? " / episodio" : ""}
                </span>
              )}
              {media.number_of_seasons && (
                <span>{media.number_of_seasons} temporadas</span>
              )}
              <span>{media.original_language?.toUpperCase()}</span>
            </div>
            <div className="genre-tags">
              {media.genres?.map((g) => (
                <span key={g.id}>{g.name}</span>
              ))}
            </div>
            <p className="synopsis">
              {media.overview || "Sin sinopsis disponible en este idioma."}
            </p>
            <dl className="credits">
              <div>
                <dt>
                  {type === "movie" ? "Dirección" : "Creación / Dirección"}
                </dt>
                <dd>
                  {directors.length
                    ? directors.map((p, i) => (
                        <span key={p.id}>
                          {i > 0 ? ", " : ""}
                          <Link href={`/person/${p.id}`}>{p.name}</Link>
                        </span>
                      ))
                    : "Sin datos"}
                </dd>
              </div>
              <div>
                <dt>País</dt>
                <dd>
                  {media.production_countries?.map((c) => c.name).join(", ") ||
                    media.origin_country?.join(", ") ||
                    "Sin datos"}
                </dd>
              </div>
              <div>
                <dt>Estudio</dt>
                <dd>
                  {media.production_companies?.map((c) => c.name).join(", ") ||
                    "Sin datos"}
                </dd>
              </div>
            </dl>
            <section className="availability-panel">
              <div className="section-heading">
                <h2>Dónde verla</h2>
                <span className="eyebrow">
                  <Globe size={13} /> {ctx.profile.region}
                </span>
              </div>
              {!a ? (
                <p role="status">
                  No pudimos verificar la disponibilidad. Intenta más tarde.
                </p>
              ) : (
                <>
                  <h3 className="lime">Incluida en tus suscripciones</h3>
                  {mine.length ? (
                    mine.map((p) => (
                      <ProviderLauncher
                        key={p.provider_id}
                        provider={p}
                        title={titleOf(media)}
                        direct={
                          links.find((l) => l.provider_id === p.provider_id)
                            ?.url
                        }
                      />
                    ))
                  ) : (
                    <p className="muted">
                      {!ctx.active.length
                        ? "Selecciona tus servicios en Configuración para encontrar coincidencias."
                        : "No hay coincidencias de suscripción reportadas para tu región."}
                    </p>
                  )}
                  {(ctx.profile.included_only
                    ? []
                    : (["flatrate", "rent", "buy", "free", "ads"] as const)
                  ).map((k) => {
                    const options = a[k].filter(
                      (p) =>
                        k !== "flatrate" ||
                        !mine.some((s) => s.provider_id === p.provider_id),
                    );
                    return options.length ? (
                      <div key={k}>
                        <h3 className="option-heading">
                          {
                            {
                              flatrate: "Otras suscripciones",
                              rent: "Alquilar",
                              buy: "Comprar",
                              free: "Gratis",
                              ads: "Con anuncios",
                            }[k]
                          }
                        </h3>
                        {options.map((p) => (
                          <ProviderLauncher
                            key={p.provider_id}
                            provider={p}
                            title={titleOf(media)}
                            direct={
                              links.find((l) => l.provider_id === p.provider_id)
                                ?.url
                            }
                          />
                        ))}
                      </div>
                    ) : null;
                  })}
                  {!["flatrate", "rent", "buy", "free", "ads"].some(
                    (k) => a[k as "rent"].length,
                  ) && (
                    <p className="muted">
                      TMDB no reporta opciones en {ctx.profile.region}. Esto no
                      confirma que el título sea inaccesible.
                    </p>
                  )}
                  <p className="fine-print">
                    Disponibilidad por JustWatch vía TMDB. Confirma precio y
                    acceso en la plataforma oficial. Los botones pueden abrir su
                    búsqueda o página principal.
                  </p>
                </>
              )}
            </section>
            {ctx.user ? (
              <MediaControls
                media={media}
                state={ctx.states.find(
                  (s) => s.tmdb_id === media.id && s.media_type === type,
                )}
                saved={ctx.watchlist.some(
                  (s) => s.tmdb_id === media.id && s.media_type === type,
                )}
              />
            ) : (
              <p className="message">
                <Link href="/auth">Inicia sesión</Link> para guardar, valorar y
                marcar este título.
              </p>
            )}
          </div>
        </div>
        {!!media.credits?.cast.length && (
          <section className="catalog-section">
            <h2>El talento detrás de la historia</h2>
            <div className="cast-row">
              {media.credits.cast.slice(0, 10).map((p) => (
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
                  <p className="muted">{p.character}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
