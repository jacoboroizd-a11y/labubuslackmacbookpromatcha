import { describe, it, expect } from "vitest";
import { included, resolveProvider } from "../src/services/providers";
import { eligibleForRecommendation } from "../src/services/recommendations";
import type { Availability, MediaState } from "../src/lib/types";
const netflix = { provider_id: 8, provider_name: "Netflix" },
  prime = { provider_id: 9, provider_name: "Amazon Prime Video" };
const availability: Availability = {
  region: "NI",
  flatrate: [netflix],
  rent: [prime],
  buy: [prime],
  free: [],
  ads: [],
};
describe("availability — NI and subscriptions", () => {
  it("only includes active flatrate providers, never rentals or purchases", () => {
    expect(included(availability, [8, 9])).toEqual([netflix]);
    expect(included(availability, [9])).toEqual([]);
  });
  it("does not guess availability when missing or failed", () => {
    expect(included(undefined, [8])).toEqual([]);
    expect(included({ ...availability, unavailable: true }, [8])).toEqual([]);
  });
  it("does not count an inactive subscription", () =>
    expect(included(availability, [])).toEqual([]));
});
describe("official provider resolver", () => {
  it("recognizes international Prime Video without including Amazon rentals or channels", () => {
    expect(
      included(
        {
          ...availability,
          flatrate: [
            { provider_id: 119, provider_name: "Amazon Prime Video" },
            { provider_id: 10, provider_name: "Amazon Video" },
          ],
        },
        [9],
      ).map((p) => p.provider_id),
    ).toEqual([119]);
    expect(resolveProvider(119, "Alien")?.url).toBe("https://primevideo.com");
  });
  it("encodes the title and labels search honestly", () => {
    const result = resolveProvider(8, "Alien & Batman");
    expect(result?.url).toBe(
      "https://www.netflix.com/search?q=Alien%20%26%20Batman",
    );
    expect(result?.label).toBe("Buscar en Netflix");
  });
  it("uses homepage rather than inventing a deep link", () =>
    expect(resolveProvider(337, "Alien")?.url).toBe("https://disneyplus.com"));
  it("accepts only an official HTTPS direct title URL", () => {
    expect(
      resolveProvider(8, "Alien", "https://www.netflix.com/title/123")?.label,
    ).toBe("Ver en Netflix");
    for (const url of [
      "javascript:alert(1)",
      "https://netflix.com.evil.test/x",
      "https://evil.test",
      "http://netflix.com/x",
      "https://user:pass@netflix.com/x",
      "https://netflix.com:444/x",
    ])
      expect(resolveProvider(8, "Alien", url)?.label).toBe("Buscar en Netflix");
  });
  it("does not invent links for unknown providers", () =>
    expect(resolveProvider(999999, "Alien")).toBeNull());
});
describe("recommendation invariant reserved for Phase 2", () => {
  const state: MediaState = {
    tmdb_id: 1,
    media_type: "movie",
    status: null,
    liked: false,
    disliked: false,
    personal_rating: null,
  };
  it("never recommends watched or not interested titles directly", () => {
    expect(
      eligibleForRecommendation({ ...state, status: "watched", liked: true }),
    ).toBe(false);
    expect(
      eligibleForRecommendation({ ...state, status: "not_interested" }),
    ).toBe(false);
  });
  it("excludes disliked titles and allows unseen titles", () => {
    expect(eligibleForRecommendation({ ...state, disliked: true })).toBe(false);
    expect(eligibleForRecommendation(undefined)).toBe(true);
  });
});
