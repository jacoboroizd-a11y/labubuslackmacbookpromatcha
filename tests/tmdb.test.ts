import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import {
  availability,
  catalog,
  regionalize,
  search,
} from "../src/services/tmdb";
beforeEach(() =>
  vi.stubEnv("TMDB_READ_ACCESS_TOKEN", "fixture-token-not-for-network-use"),
);
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("TMDB adapter with isolated response fixtures", () => {
  it("never falls back from missing NI data to US providers", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({
              results: {
                US: {
                  flatrate: [{ provider_id: 8, provider_name: "Netflix" }],
                },
              },
            }),
          ),
        ),
    );
    const ni = await availability("movie", 1, "NI");
    expect(ni.region).toBe("NI");
    expect(ni.flatrate).toEqual([]);
    expect(ni.rent).toEqual([]);
  });
  it("keeps monetization types separate for the exact requested country", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({
              results: {
                NI: {
                  flatrate: [{ provider_id: 8, provider_name: "Netflix" }],
                  rent: [{ provider_id: 9, provider_name: "Prime" }],
                },
              },
            }),
          ),
        ),
    );
    const ni = await availability("movie", 1, "NI");
    expect(ni.flatrate.map((p) => p.provider_id)).toEqual([8]);
    expect(ni.rent.map((p) => p.provider_id)).toEqual([9]);
  });
  it("passes region to discovery and never exposes the bearer in the URL", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            results: [{ id: 1, title: "Fixture", vote_average: 8 }],
          }),
        ),
      );
    vi.stubGlobal("fetch", fetcher);
    const results = await catalog("movie", "NI");
    const url = fetcher.mock.calls[0][0] as URL;
    expect(url.searchParams.get("watch_region")).toBe("NI");
    expect(url.searchParams.has("api_key")).toBe(false);
    expect(results[0].media_type).toBe("movie");
  });
  it("represents provider failures as unknown instead of confirmed unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 503 })),
    );
    const map = await regionalize(
      [{ id: 1, media_type: "tv", name: "Fixture", vote_average: 7 }],
      "NI",
    );
    expect(map.get("tv:1")?.unavailable).toBe(true);
  });
  it("reports upstream errors and refuses unconfigured requests", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 401 })),
    );
    await expect(search("Alien")).rejects.toThrow("TMDB_UNAVAILABLE");
    vi.stubEnv("TMDB_READ_ACCESS_TOKEN", "");
    await expect(search("Alien")).rejects.toThrow("TMDB_NOT_CONFIGURED");
  });
});
