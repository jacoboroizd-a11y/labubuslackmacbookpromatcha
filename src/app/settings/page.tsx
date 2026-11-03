import Link from "next/link";
import { Check, Globe, ShieldCheck, ArrowUpRight } from "lucide-react";
import { context } from "@/services/userMedia";
import { tmdbConfigured } from "@/services/tmdb";
import { SERVICES } from "@/services/providers";
import { saveProfile, toggleService } from "@/app/actions";
import { Submit } from "@/components/Submit";
import { Message } from "@/components/Notice";
export const metadata = { title: "Configuración" };
export default async function Settings({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const ctx = await context();
  const { message } = await searchParams;
  return (
    <main className="page-content inner-page narrow">
      <div className="page-heading">
        <span className="eyebrow lime">A TU MANERA</span>
        <h1>Tu mundo, tus reglas.</h1>
        <p>Personaliza lo que ves. Empieza con lo que ya pagas.</p>
      </div>
      <Message message={message} />
      {!ctx.user && (
        <p className="message">
          <Link href="/auth">Inicia sesión o crea tu cuenta</Link> para guardar
          tus preferencias.
        </p>
      )}
      <section className="settings-section">
        <span className="eyebrow">01 / TU PERFIL</span>
        <h2>Una biblioteca a tu nombre</h2>
        <form action={saveProfile} className="form-grid">
          <label>
            Nombre
            <input
              name="display_name"
              maxLength={80}
              defaultValue={ctx.profile.display_name}
              placeholder="¿Cómo te llamas?"
              disabled={!ctx.user}
            />
          </label>
          <label>
            <Globe size={14} /> Región
            <select
              name="region"
              defaultValue={ctx.profile.region}
              disabled={!ctx.user}
            >
              {Array.from(
                new Set([
                  ctx.profile.region,
                  "NI",
                  "CR",
                  "HN",
                  "SV",
                  "GT",
                  "PA",
                  "MX",
                  "ES",
                  "AR",
                  "CO",
                  "CL",
                  "PE",
                  "US",
                  "BR",
                ]),
              ).map((code) => (
                <option key={code} value={code}>
                  {new Intl.DisplayNames(["es"], { type: "region" }).of(code)} (
                  {code})
                </option>
              ))}
            </select>
          </label>
          <label className="checkbox full">
            <input
              type="checkbox"
              name="included_only"
              defaultChecked={ctx.profile.included_only}
              disabled={!ctx.user}
            />{" "}
            Mostrar solo títulos incluidos en mis suscripciones
          </label>
          <Submit disabled={!ctx.user}>Guardar preferencias</Submit>
        </form>
        <p className="fine-print">
          La disponibilidad siempre respeta tu región. No usamos datos de
          Estados Unidos como reemplazo.
        </p>
      </section>
      <section className="settings-section">
        <span className="eyebrow">02 / TUS SUSCRIPCIONES</span>
        <h2>Mis servicios de streaming</h2>
        <p className="muted">
          Activa los que ya tienes. No necesitamos sus contraseñas.
        </p>
        <div className="services-grid">
          {SERVICES.map((s) => {
            const active = ctx.active.includes(s.id);
            return (
              <form action={toggleService} key={s.id}>
                <input type="hidden" name="provider_id" value={s.id} />
                <input type="hidden" name="active" value={String(!active)} />
                <button
                  className={`service-select ${active ? "selected" : ""}`}
                  aria-pressed={active}
                  disabled={!ctx.user}
                >
                  <span
                    className="service-mark"
                    style={{ background: s.color }}
                  >
                    {s.mark}
                  </span>
                  <strong>{s.name}</strong>
                  <span className="service-check">
                    {active ? <Check size={16} /> : "+"}
                  </span>
                </button>
              </form>
            );
          })}
        </div>
        <p className="fine-print">
          Activar un servicio registra tu suscripción. No confirma que opere o
          tenga títulos en tu región.
        </p>
      </section>
      <section className="settings-section">
        <span className="eyebrow">03 / CONEXIONES</span>
        <h2>Estado de la aplicación</h2>
        <div className="connection-row">
          <span>TMDB · Catálogo y disponibilidad</span>
          <span className={tmdbConfigured() ? "lime" : "muted"}>
            {tmdbConfigured()
              ? "Token configurado"
              : "Pendiente de configuración"}
          </span>
        </div>
        <div className="connection-row">
          <span>Supabase · Cuenta y biblioteca</span>
          <span className={ctx.configured ? "lime" : "muted"}>
            {ctx.configured ? "Configurado" : "Pendiente de configuración"}
          </span>
        </div>
        <p className="fine-print">
          La presencia de credenciales no garantiza una conexión válida. Las
          instrucciones están en README.md y las variables en .env.example.
        </p>
        <div className="privacy-note">
          <ShieldCheck size={24} />
          <p>
            Tus plataformas siguen siendo tuyas. Frame nunca almacena
            contraseñas de streaming, cookies ni contenido protegido.
          </p>
        </div>
        <a
          href="https://www.themoviedb.org/settings/api"
          className="text-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Obtener acceso API de TMDB <ArrowUpRight size={14} />
        </a>
      </section>
    </main>
  );
}
