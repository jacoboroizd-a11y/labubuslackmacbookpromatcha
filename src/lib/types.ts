export type MediaType = "movie" | "tv";
export type Media = {
  id: number;
  media_type: MediaType;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  popularity?: number;
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  original_language?: string;
  genres?: { id: number; name: string }[];
  production_companies?: { id: number; name: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  origin_country?: string[];
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew: { id: number; name: string; job: string }[];
  };
  created_by?: { id: number; name: string }[];
};
export type Person = {
  id: number;
  media_type: "person";
  name: string;
  profile_path?: string | null;
  known_for_department?: string;
  biography?: string;
  birthday?: string;
  known_for?: Media[];
  combined_credits?: { cast: Media[]; crew: Media[] };
};
export type Provider = {
  provider_id: number;
  provider_name: string;
  logo_path?: string;
};
export type Availability = {
  region: string;
  link?: string;
  flatrate: Provider[];
  rent: Provider[];
  buy: Provider[];
  free: Provider[];
  ads: Provider[];
  unavailable?: boolean;
};
export type MediaState = {
  tmdb_id: number;
  media_type: MediaType;
  status: "want_to_watch" | "watching" | "watched" | "not_interested" | null;
  liked: boolean;
  disliked: boolean;
  personal_rating: number | null;
  watched_at?: string | null;
};
export const titleOf = (m: Media) => m.title || m.name || "Sin título";
export const yearOf = (m: Media) =>
  (m.release_date || m.first_air_date || "").slice(0, 4);
export const mediaKey = (m: { id: number; media_type: MediaType }) =>
  `${m.media_type}:${m.id}`;
