import "server-only";
import type { Media, MediaType, Person, Availability } from "@/lib/types";
export const tmdbConfigured = () => Boolean(process.env.TMDB_READ_ACCESS_TOKEN);
async function request<T>(
  path: string,
  params: Record<string, string> = {},
  ttl = 86400,
): Promise<T> {
  if (!tmdbConfigured()) throw new Error("TMDB_NOT_CONFIGURED");
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  url.searchParams.set("language", "es-MX");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}` },
    next: { revalidate: ttl },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok)
    throw new Error(
      res.status === 404 ? "MEDIA_NOT_FOUND" : "TMDB_UNAVAILABLE",
    );
  return res.json();
}
export async function catalog(
  type: MediaType,
  region: string,
): Promise<Media[]> {
  const data = await request<{ results: Media[] }>(
    `/discover/${type}`,
    {
      watch_region: region,
      region,
      sort_by: "popularity.desc",
      include_adult: "false",
    },
    3600,
  );
  return data.results.map((m) => ({ ...m, media_type: type }));
}
export async function search(query: string): Promise<(Media | Person)[]> {
  const data = await request<{ results: (Media | Person)[] }>(
    "/search/multi",
    { query, include_adult: "false" },
    300,
  );
  return data.results.filter((m) =>
    ["movie", "tv", "person"].includes(m.media_type),
  );
}
export async function detail(type: MediaType, id: number): Promise<Media> {
  return {
    ...(await request<Media>(`/${type}/${id}`, {
      append_to_response: "credits",
    })),
    media_type: type,
  };
}
export async function person(id: number): Promise<Person> {
  return {
    ...(await request<Person>(`/person/${id}`, {
      append_to_response: "combined_credits",
    })),
    media_type: "person",
  };
}
export async function availability(
  type: MediaType,
  id: number,
  region: string,
): Promise<Availability> {
  const data = await request<{
    results: Record<string, Partial<Availability>>;
  }>(`/${type}/${id}/watch/providers`, {}, 3600);
  const found = data.results[region];
  return {
    region,
    link: found?.link,
    flatrate: found?.flatrate || [],
    rent: found?.rent || [],
    buy: found?.buy || [],
    free: found?.free || [],
    ads: found?.ads || [],
  };
}
export async function regionalize(items: Media[], region: string) {
  // At most 20 titles per page, five concurrent provider requests, never an unbounded fanout.
  const result = new Map<string, Availability>();
  for (let i = 0; i < Math.min(items.length, 20); i += 5) {
    await Promise.all(
      items.slice(i, i + 5).map(async (m) => {
        try {
          result.set(
            `${m.media_type}:${m.id}`,
            await availability(m.media_type, m.id, region),
          );
        } catch {
          result.set(`${m.media_type}:${m.id}`, {
            region,
            flatrate: [],
            rent: [],
            buy: [],
            free: [],
            ads: [],
            unavailable: true,
          });
        }
      }),
    );
  }
  return result;
}
