import Link from "next/link";
export default function NotFound() {
  return (
    <main className="page-content inner-page">
      <div className="empty">
        <span className="eyebrow lime">ESCENA NO ENCONTRADA</span>
        <h1>Este título se salió del guion.</h1>
        <p>No encontramos la página que buscas.</p>
        <Link className="button primary" href="/discover">
          Explorar catálogo
        </Link>
      </div>
    </main>
  );
}
