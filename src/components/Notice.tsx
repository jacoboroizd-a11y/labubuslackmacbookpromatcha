import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
export function SetupNotice() {
  return (
    <div className="notice">
      <Sparkles size={22} />
      <div>
        <strong>Tu próxima buena película empieza aquí.</strong>
        <p>
          Conecta TMDB para explorar el catálogo real. Configura Supabase para
          guardar tus servicios e historial.
        </p>
      </div>
      <Link href="/settings" className="text-link">
        Configurar <ArrowRight size={16} />
      </Link>
    </div>
  );
}
export function Message({ message }: { message?: string }) {
  return message ? (
    <p role="status" className="message">
      {message}
    </p>
  ) : null;
}
export function Empty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty">
      <Sparkles size={28} />
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
