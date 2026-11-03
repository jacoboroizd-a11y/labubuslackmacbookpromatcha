import Image from "next/image";
import { notFound } from "next/navigation";
import { person, regionalize, tmdbConfigured } from "@/services/tmdb";
import { context } from "@/services/userMedia";
import { Catalog } from "@/components/Catalog";
import { SetupNotice, Empty } from "@/components/Notice";
import type { Media } from "@/lib/types";
export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id) || Number(id) < 1) notFound();
  if (!tmdbConfigured())
    return (
      <main className="page-content inner-page">
        <SetupNotice />
      </main>
    );
  let p;
  try {
    p = await person(Number(id));
  } catch (e) {
    if (e instanceof Error && e.message === "MEDIA_NOT_FOUND") notFound();
    return (
      <main className="page-content inner-page">
        <Empty
          title="No se pudo cargar esta persona"
          description="Intenta de nuevo más tarde."
        />
      </main>
    );
  }
  const ctx = await context();
  const all = [
    ...(p.combined_credits?.cast || []),
    ...(p.combined_credits?.crew || []),
  ].filter((m) => m.media_type === "movie" || m.media_type === "tv");
  const seen = new Set<string>();
  const items: Media[] = all
    .filter((m) => {
      const k = `${m.media_type}:${m.id}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 20);
  const availability = await regionalize(items, ctx.profile.region);
  return (
    <main className="page-content inner-page">
      <div className="person-heading">
        {p.profile_path && (
          <Image
            src={`https://image.tmdb.org/t/p/w185${p.profile_path}`}
            alt={p.name}
            width={160}
            height={240}
          />
        )}
        <div>
          <span className="eyebrow lime">
            {p.known_for_department || "PERSONA"}
          </span>
          <h1>{p.name}</h1>
          <p className="synopsis">
            {p.biography?.slice(0, 800) ||
              "Sin biografía disponible en este idioma."}
          </p>
        </div>
      </div>
      <div className="section-heading">
        <h2>Filmografía destacada</h2>
        <span className="muted">Hasta 20 títulos populares</span>
      </div>
      <Catalog
        items={items}
        availability={availability}
        active={ctx.active}
        states={ctx.states}
        includedOnly={ctx.profile.included_only}
      />
    </main>
  );
}
