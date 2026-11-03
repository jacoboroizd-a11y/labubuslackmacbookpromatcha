"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="page-content inner-page">
      <div className="empty">
        <h1>Esta escena necesita otra toma.</h1>
        <p>
          No pudimos cargar los datos. Revisa la conexión y, si estás
          configurando Frame, la migración de Supabase.
        </p>
        <button className="button primary" onClick={reset}>
          Volver a intentar
        </button>
      </div>
    </main>
  );
}
