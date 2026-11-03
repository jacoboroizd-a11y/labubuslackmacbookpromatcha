import type { MediaState } from "@/lib/types";
// Shared invariant for the Phase 2 engine; no scoring engine is shipped in Phase 1.
export function eligibleForRecommendation(state: MediaState | undefined) {
  return (
    !state ||
    (state.status !== "watched" &&
      state.status !== "not_interested" &&
      !state.disliked)
  );
}
