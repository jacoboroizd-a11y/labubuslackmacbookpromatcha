import "server-only";
import { cache } from "react";
import { supabase, authConfigured } from "@/lib/supabase/server";
import type { MediaState } from "@/lib/types";
export const context = cache(async function context() {
  const db = await supabase();
  const empty = {
    user: null as { id: string; email?: string } | null,
    profile: { display_name: "", region: "NI", included_only: false },
    active: [] as number[],
    states: [] as MediaState[],
    watchlist: [] as {
      tmdb_id: number;
      media_type: "movie" | "tv";
      created_at: string;
    }[],
    configured: authConfigured(),
  };
  if (!db) return empty;
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return empty;
  const [profile, services, states, watchlist] = await Promise.all([
    db
      .from("user_profiles")
      .select("display_name,region,included_only")
      .eq("id", user.id)
      .single(),
    db
      .from("user_streaming_services")
      .select("provider_id")
      .eq("user_id", user.id)
      .eq("active", true),
    db.from("user_media_state").select("*").eq("user_id", user.id),
    db
      .from("watchlist")
      .select("tmdb_id,media_type,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);
  if ([profile, services, states, watchlist].some((r) => r.error))
    throw new Error(
      "No se pudieron cargar tus datos. Revisa la conexión y la migración de Supabase.",
    );
  return {
    ...empty,
    user: { id: user.id, email: user.email },
    profile: profile.data || empty.profile,
    active: (services.data || []).map((s) => s.provider_id),
    states: (states.data || []) as MediaState[],
    watchlist: watchlist.data || [],
  };
});
