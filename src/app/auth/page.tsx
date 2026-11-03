import { authenticate } from "@/app/actions";
import { authConfigured } from "@/lib/supabase/server";
import { Submit } from "@/components/Submit";
import { Message } from "@/components/Notice";
export const metadata = { title: "Tu cuenta" };
export default async function Auth({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; mode?: string }>;
}) {
  const { message, mode } = await searchParams;
  const signup = mode === "signup",
    reset = mode === "reset";
  return (
    <main className="page-content inner-page auth-page">
      <div className="auth-intro">
        <span className="eyebrow lime">BIENVENIDO A TU PRÓXIMA HISTORIA</span>
        <h1>
          Tu buen gusto.
          <br />
          Un solo lugar.
        </h1>
        <p>
          Guarda tus favoritas. Recuerda lo que viste.
          <br />
          Encuentra lo que sigue.
        </p>
        <div className="auth-quote">
          “La mejor parte de una película
          <br />
          es encontrar la próxima.”<span>EL ESPÍRITU DE FRAME</span>
        </div>
      </div>
      <section className="auth-card">
        <h2>
          {reset
            ? "Recuperar contraseña"
            : signup
              ? "Crea tu cuenta"
              : "Qué bueno verte"}
        </h2>
        <p className="muted">
          {reset
            ? "Te enviaremos un enlace por correo."
            : signup
              ? "Tu biblioteca empieza aquí."
              : "Tu próxima película te espera."}
        </p>
        <Message message={message} />
        {!authConfigured() && (
          <p className="message">
            Configura las variables de Supabase y aplica la migración para
            habilitar las cuentas.
          </p>
        )}
        <form action={authenticate} className="form-stack">
          <input
            type="hidden"
            name="mode"
            value={reset ? "reset" : signup ? "signup" : "login"}
          />
          {signup && (
            <label>
              Nombre
              <input
                name="display_name"
                autoComplete="name"
                maxLength={80}
                required
              />
            </label>
          )}
          <label>
            Correo electrónico
            <input name="email" type="email" autoComplete="email" required />
          </label>
          {!reset && (
            <label>
              Contraseña
              <input
                name="password"
                type="password"
                minLength={8}
                autoComplete={signup ? "new-password" : "current-password"}
                required
              />
            </label>
          )}
          <Submit disabled={!authConfigured()}>
            {reset
              ? "Enviar enlace"
              : signup
                ? "Crear cuenta"
                : "Iniciar sesión"}
          </Submit>
        </form>
        <div className="auth-links">
          <a href={signup || reset ? "/auth" : "/auth?mode=signup"}>
            {signup || reset ? "Ya tengo cuenta" : "Crear una cuenta"}
          </a>
          {!reset && <a href="/auth?mode=reset">Olvidé mi contraseña</a>}
        </div>
        <p className="fine-print">
          Solo tu cuenta de Frame. Nunca pediremos tus claves de Netflix,
          Disney+ u otras plataformas.
        </p>
      </section>
    </main>
  );
}
