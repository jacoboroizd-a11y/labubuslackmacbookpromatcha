"use server";
import { supabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SERVICES } from "@/services/providers";
const text = (f: FormData, k: string) => String(f.get(k) || "");
function destination(f: FormData) {
  const p = text(f, "returnTo");
  return p.startsWith("/") && !p.startsWith("//") && !p.includes("\\")
    ? p
    : "/";
}
async function session() {
  const db = await supabase();
  if (!db) redirect("/auth?message=Configura%20Supabase%20para%20continuar");
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/auth");
  return { db, user };
}
function fail(path: string, message: string): never {
  redirect(
    `${path}${path.includes("?") ? "&" : "?"}message=${encodeURIComponent(message)}`,
  );
}
export async function authenticate(f: FormData) {
  const db = await supabase();
  if (!db) fail("/auth", "Falta configurar Supabase.");
  const mode = text(f, "mode"),
    email = text(f, "email").trim(),
    password = text(f, "password");
  const origin = (await headers()).get("origin");
  if (!origin)
    fail("/auth", "No se pudo identificar el origen de la solicitud.");
  if (mode === "reset") {
    const { error } = await db.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/auth/reset`,
    });
    if (error)
      fail(
        "/auth",
        "No se pudo enviar el correo de recuperación. Intenta más tarde.",
      );
    fail(
      "/auth",
      "Si la cuenta existe, recibirás un correo para restablecer tu contraseña.",
    );
  }
  if (password.length < 8)
    fail("/auth", "Usa una contraseña de al menos 8 caracteres.");
  if (mode === "signup") {
    const { error } = await db.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: { display_name: text(f, "display_name").slice(0, 80) },
      },
    });
    if (error)
      fail(
        "/auth",
        "No se pudo crear la cuenta. Revisa tus datos e intenta nuevamente.",
      );
    fail(
      "/auth",
      "Revisa tu correo para confirmar la cuenta y luego inicia sesión.",
    );
  }
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error)
    fail(
      "/auth",
      "No se pudo iniciar sesión. Revisa tus credenciales y confirma tu correo.",
    );
  revalidatePath("/", "layout");
  redirect("/");
}
export async function resetPassword(f: FormData) {
  const { db } = await session();
  const password = text(f, "password");
  if (password.length < 8) fail("/auth/reset", "Usa al menos 8 caracteres.");
  const { error } = await db.auth.updateUser({ password });
  if (error)
    fail(
      "/auth/reset",
      "No se pudo actualizar la contraseña. Solicita un enlace nuevo.",
    );
  redirect("/profile?message=Contrase%C3%B1a%20actualizada");
}
export async function signOut() {
  const { db } = await session();
  await db.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
export async function saveProfile(f: FormData) {
  const { db, user } = await session();
  const region = text(f, "region").toUpperCase();
  if (!/^[A-Z]{2}$/.test(region))
    fail("/settings", "Usa un código de país de dos letras.");
  try {
    new Intl.DisplayNames(["es"], { type: "region" }).of(region);
  } catch {
    fail("/settings", "Región inválida.");
  }
  const { error } = await db
    .from("user_profiles")
    .update({
      display_name: text(f, "display_name").trim().slice(0, 80),
      region,
      included_only: f.has("included_only"),
    })
    .eq("id", user.id);
  if (error) fail("/settings", "No se pudo guardar el perfil.");
  revalidatePath("/", "layout");
  redirect("/settings?message=Preferencias%20guardadas");
}
export async function toggleService(f: FormData) {
  const { db, user } = await session();
  const id = Number(f.get("provider_id"));
  if (!SERVICES.some((p) => p.id === id))
    fail("/settings", "Proveedor inválido.");
  const { error } = await db
    .from("user_streaming_services")
    .upsert(
      {
        user_id: user.id,
        provider_id: id,
        active: text(f, "active") === "true",
      },
      { onConflict: "user_id,provider_id" },
    );
  if (error) fail("/settings", "No se pudo guardar el servicio.");
  revalidatePath("/", "layout");
}
function mediaInput(f: FormData) {
  const id = Number(f.get("tmdb_id")),
    type = text(f, "media_type");
  if (
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    (type !== "movie" && type !== "tv")
  )
    throw new Error("Título inválido.");
  return { id, type };
}
export async function toggleWatchlist(f: FormData) {
  const { db, user } = await session();
  const { id, type } = mediaInput(f);
  const query = db.from("watchlist");
  const { error } =
    text(f, "remove") === "true"
      ? await query
          .delete()
          .eq("user_id", user.id)
          .eq("tmdb_id", id)
          .eq("media_type", type)
      : await query.upsert(
          { user_id: user.id, tmdb_id: id, media_type: type },
          { onConflict: "user_id,tmdb_id,media_type" },
        );
  if (error) fail(destination(f), "No se pudo actualizar tu lista.");
  revalidatePath("/", "layout");
}
export async function saveMediaState(f: FormData) {
  const { db, user } = await session();
  const { id, type } = mediaInput(f);
  const status = text(f, "status") || null,
    rating = Number(f.get("personal_rating")) || null,
    reaction = text(f, "reaction");
  if (
    status &&
    !["want_to_watch", "watching", "watched", "not_interested"].includes(status)
  )
    throw new Error("Estado inválido.");
  if (
    rating !== null &&
    (!Number.isInteger(rating) || rating < 1 || rating > 5)
  )
    throw new Error("Valoración inválida.");
  const { data: old, error: readError } = await db
    .from("user_media_state")
    .select("watched_at")
    .eq("user_id", user.id)
    .eq("tmdb_id", id)
    .eq("media_type", type)
    .maybeSingle();
  if (readError) fail(destination(f), "No se pudo leer el estado anterior.");
  const { error } = await db
    .from("user_media_state")
    .upsert(
      {
        user_id: user.id,
        tmdb_id: id,
        media_type: type,
        status,
        liked: reaction === "like",
        disliked: reaction === "dislike",
        personal_rating: rating,
        watched_at:
          status === "watched"
            ? old?.watched_at || new Date().toISOString()
            : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,tmdb_id,media_type" },
    );
  if (error) fail(destination(f), "No se pudo guardar tu estado.");
  revalidatePath("/", "layout");
  redirect(destination(f) + "?message=Estado%20guardado");
}
