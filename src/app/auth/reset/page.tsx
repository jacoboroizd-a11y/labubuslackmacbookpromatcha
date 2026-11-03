import { resetPassword } from "@/app/actions";
import { Submit } from "@/components/Submit";
import { Message } from "@/components/Notice";
import { context } from "@/services/userMedia";
import Link from "next/link";
export default async function Reset({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const ctx = await context();
  const { message } = await searchParams;
  return (
    <main className="page-content inner-page narrow">
      <h1>Nueva contraseña</h1>
      <Message message={message} />
      {ctx.user ? (
        <form action={resetPassword} className="form-stack">
          <label>
            Contraseña nueva
            <input
              name="password"
              type="password"
              minLength={8}
              autoComplete="new-password"
              required
            />
          </label>
          <Submit>Actualizar contraseña</Submit>
        </form>
      ) : (
        <p className="message">
          Abre el enlace de recuperación de tu correo.{" "}
          <Link href="/auth?mode=reset">Solicitar otro enlace</Link>
        </p>
      )}
    </main>
  );
}
