import type { Availability, Provider } from "@/lib/types";
export const SERVICES = [
  { id: 8, name: "Netflix", color: "#E50914", mark: "N", host: "netflix.com" },
  {
    id: 337,
    name: "Disney+",
    color: "#1261db",
    mark: "D+",
    host: "disneyplus.com",
  },
  { id: 1899, name: "Max", color: "#4851ed", mark: "max", host: "max.com" },
  {
    id: 9,
    name: "Amazon Prime Video",
    color: "#00a8e1",
    mark: "prime",
    host: "primevideo.com",
  },
  {
    id: 350,
    name: "Apple TV+",
    color: "#777",
    mark: "tv+",
    host: "tv.apple.com",
  },
  {
    id: 531,
    name: "Paramount+",
    color: "#1264ed",
    mark: "P+",
    host: "paramountplus.com",
  },
  { id: 457, name: "ViX", color: "#f66722", mark: "ViX", host: "vix.com" },
  {
    id: 283,
    name: "Crunchyroll",
    color: "#f47521",
    mark: "C",
    host: "crunchyroll.com",
  },
  { id: 11, name: "MUBI", color: "#1666ed", mark: "M", host: "mubi.com" },
  { id: 386, name: "Peacock", color: "#777", mark: "p", host: "peacocktv.com" },
  { id: 15, name: "Hulu", color: "#1ce783", mark: "hulu", host: "hulu.com" },
  { id: 192, name: "YouTube", color: "#f00", mark: "YT", host: "youtube.com" },
];
// TMDB uses both IDs for the same Prime Video subscription in different markets.
export const canonicalProviderId = (id: number) => (id === 119 ? 9 : id);
export function included(
  a: Availability | undefined,
  active: number[],
): Provider[] {
  return a?.unavailable
    ? []
    : (a?.flatrate || []).filter((p) =>
        active.some(
          (id) =>
            canonicalProviderId(id) === canonicalProviderId(p.provider_id),
        ),
      );
}
export function resolveProvider(
  id: number,
  title: string,
  direct?: string,
): { url: string; label: string } | null {
  const service = SERVICES.find((p) => p.id === canonicalProviderId(id));
  if (!service) return null;
  if (direct) {
    try {
      const u = new URL(direct);
      if (
        u.protocol === "https:" &&
        !u.username &&
        !u.password &&
        !u.port &&
        (u.hostname === service.host || u.hostname.endsWith(`.${service.host}`))
      )
        return { url: u.href, label: `Ver en ${service.name}` };
    } catch {
      /* fall through to official destination */
    }
  }
  if (id === 8)
    return {
      url: `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
      label: "Buscar en Netflix",
    };
  if (id === 192)
    return {
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`,
      label: "Buscar en YouTube",
    };
  return { url: `https://${service.host}`, label: `Abrir ${service.name}` };
}
