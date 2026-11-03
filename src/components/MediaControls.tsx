import { saveMediaState, toggleWatchlist } from "@/app/actions";
import type { Media, MediaState } from "@/lib/types";
import { Submit } from "./Submit";
export function MediaControls({
  media,
  state,
  saved,
}: {
  media: Media;
  state?: MediaState;
  saved: boolean;
}) {
  const path = `/media/${media.media_type}/${media.id}`;
  const hidden = (
    <>
      <input type="hidden" name="tmdb_id" value={media.id} />
      <input type="hidden" name="media_type" value={media.media_type} />
      <input type="hidden" name="returnTo" value={path} />
    </>
  );
  return (
    <section className="personal-panel">
      <div className="section-heading">
        <h2>Tu contexto</h2>
        <span className="eyebrow">SOLO PARA TI</span>
      </div>
      <form action={toggleWatchlist}>
        {hidden}
        <input type="hidden" name="remove" value={String(saved)} />
        <Submit className="button">
          {saved ? "✓ Quitar de mi lista" : "+ Agregar a mi lista"}
        </Submit>
      </form>
      <form action={saveMediaState} className="form-grid">
        {hidden}
        <label>
          Estado
          <select name="status" defaultValue={state?.status || ""}>
            <option value="">Sin marcar</option>
            <option value="want_to_watch">Quiero verla</option>
            <option value="watching">Viendo</option>
            <option value="watched">Vista</option>
            <option value="not_interested">No me interesa</option>
          </select>
        </label>
        <label>
          Tu valoración
          <select
            name="personal_rating"
            defaultValue={state?.personal_rating || ""}
          >
            <option value="">Sin valorar</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {"★".repeat(n)}
              </option>
            ))}
          </select>
        </label>
        <label>
          ¿Qué te pareció?
          <select
            name="reaction"
            defaultValue={
              state?.liked ? "like" : state?.disliked ? "dislike" : ""
            }
          >
            <option value="">Sin opinión</option>
            <option value="like">Me gusta</option>
            <option value="dislike">No me gusta</option>
          </select>
        </label>
        <Submit>Guardar estado</Submit>
      </form>
    </section>
  );
}
