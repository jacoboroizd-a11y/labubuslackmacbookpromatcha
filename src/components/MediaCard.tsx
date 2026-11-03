import Link from "next/link";
import Image from "next/image";
import { Star, Check, ArrowUpRight } from "lucide-react";
import {
  titleOf,
  yearOf,
  type Media,
  type Availability,
  type MediaState,
} from "@/lib/types";
import { included } from "@/services/providers";
export function MediaCard({
  media,
  availability,
  active,
  state,
}: {
  media: Media;
  availability?: Availability;
  active: number[];
  state?: MediaState;
}) {
  const providers = included(availability, active);
  return (
    <Link
      className="media-card"
      href={`/media/${media.media_type}/${media.id}`}
    >
      <div className="poster">
        {media.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
            alt={titleOf(media)}
            fill
            sizes="(max-width: 600px) 44vw, (max-width: 1000px) 24vw, 17vw"
          />
        ) : (
          <div className="poster-fallback">{titleOf(media)}</div>
        )}
        <span className="rating">
          <Star size={11} fill="currentColor" />
          {media.vote_average?.toFixed(1) || "—"}
        </span>
        {state?.status === "watched" && (
          <span className="watched-tag">
            <Check size={12} /> Vista
          </span>
        )}
        <span className="card-open">
          <ArrowUpRight />
        </span>
      </div>
      <h3>{titleOf(media)}</h3>
      <div className="card-meta">
        <span>{yearOf(media) || "Sin fecha"}</span>
        <span>·</span>
        <span>{media.media_type === "tv" ? "Serie" : "Película"}</span>
      </div>
      <p
        className={
          providers.length ? "provider-caption included" : "provider-caption"
        }
      >
        {providers.length
          ? `● ${providers.map((p) => p.provider_name).join(" · ")}`
          : availability?.unavailable
            ? "Disponibilidad sin verificar"
            : availability
              ? "Sin suscripción coincidente"
              : "Ver disponibilidad"}
      </p>
    </Link>
  );
}
