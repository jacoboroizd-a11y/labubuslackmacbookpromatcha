import Link from "next/link";
import { MediaCard } from "./MediaCard";
import { Empty } from "./Notice";
import { included } from "@/services/providers";
import {
  mediaKey,
  type Media,
  type Availability,
  type MediaState,
} from "@/lib/types";
export function Catalog({
  items,
  availability,
  active,
  states,
  includedOnly = false,
}: {
  items: Media[];
  availability: Map<string, Availability>;
  active: number[];
  states: MediaState[];
  includedOnly?: boolean;
}) {
  const visible = items.filter(
    (m) =>
      !includedOnly || included(availability.get(mediaKey(m)), active).length,
  );
  if (!visible.length)
    return (
      <Empty
        title={
          includedOnly
            ? "Sin coincidencias en tus servicios"
            : "Nada por aquí todavía"
        }
        description={
          includedOnly
            ? "No encontramos títulos incluidos en esta página de resultados. Cambia tus servicios, región o desactiva el filtro para explorar más."
            : "Prueba otra búsqueda o vuelve más tarde."
        }
      />
    );
  return (
    <>
      <div className="catalog-grid">
        {visible.map((m) => (
          <MediaCard
            key={mediaKey(m)}
            media={m}
            availability={availability.get(mediaKey(m))}
            active={active}
            state={states.find(
              (s) => s.tmdb_id === m.id && s.media_type === m.media_type,
            )}
          />
        ))}
      </div>
      {[...availability.values()].some((a) => a.unavailable) && (
        <p className="muted">
          Parte de la disponibilidad no pudo verificarse.{" "}
          <Link href="/discover">Volver a intentar</Link>
        </p>
      )}
    </>
  );
}
