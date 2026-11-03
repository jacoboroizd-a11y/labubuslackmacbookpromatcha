import Link from "next/link";
import { UserRound, Film, Heart, Bookmark, Star } from "lucide-react";
import { context } from "@/services/userMedia";
import { signOut } from "@/app/actions";
import { Empty, Message } from "@/components/Notice";
import { Submit } from "@/components/Submit";
export const metadata = { title: "Mi perfil" };
export default async function Profile({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const ctx = await context();
  const { message } = await searchParams;
  if (!ctx.user)
    return (
      <main className="page-content inner-page">
        <Empty
          title="Tu historia, a tu manera"
          description="Crea una cuenta para construir tu biblioteca personal de entretenimiento."
        />
        <Link href="/auth" className="button primary">
          Entrar a Frame
        </Link>
      </main>
    );
  const watched = ctx.states.filter((s) => s.status === "watched");
  const ratings = ctx.states.filter((s) => s.personal_rating !== null);
  const average = ratings.length
    ? (
        ratings.reduce((sum, s) => sum + s.personal_rating!, 0) / ratings.length
      ).toFixed(1)
    : "—";
  const stats = [
    {
      Icon: Film,
      label: "Películas vistas",
      value: watched.filter((s) => s.media_type === "movie").length,
    },
    {
      Icon: Film,
      label: "Series marcadas vistas",
      value: watched.filter((s) => s.media_type === "tv").length,
    },
    { Icon: Bookmark, label: "En tu lista", value: ctx.watchlist.length },
    {
      Icon: Heart,
      label: "Te gustan",
      value: ctx.states.filter((s) => s.liked).length,
    },
    { Icon: Star, label: "Tu rating promedio", value: average },
  ];
  return (
    <main className="page-content inner-page">
      <Message message={message} />
      <div className="profile-heading">
        <div className="profile-avatar">
          <UserRound size={42} />
        </div>
        <div>
          <span className="eyebrow lime">TU VIDA EN HISTORIAS</span>
          <h1>{ctx.profile.display_name || "Tu perfil"}</h1>
          <p className="muted">
            {ctx.user.email} · {ctx.profile.region} · {ctx.active.length}{" "}
            servicios activos
          </p>
        </div>
      </div>
      <div className="stats-grid">
        {stats.map(({ Icon, label, value }) => (
          <div className="stat" key={label}>
            <Icon size={23} />
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <section className="settings-section">
        <h2>Una biblioteca que crece contigo</h2>
        <p className="muted">
          Tus valoraciones y estados se guardan por cuenta. El progreso de
          episodios, las sagas y las estadísticas avanzadas llegarán en las
          siguientes fases.
        </p>
        <div className="hero-actions">
          <Link className="button primary" href="/watchlist">
            Ver mi lista
          </Link>
          <Link className="button" href="/settings">
            Editar preferencias
          </Link>
          <form action={signOut}>
            <Submit className="button">Cerrar sesión</Submit>
          </form>
        </div>
      </section>
    </main>
  );
}
