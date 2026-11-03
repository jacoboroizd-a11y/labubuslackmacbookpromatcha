export default function Loading() {
  return (
    <main
      className="page-content inner-page"
      aria-busy="true"
      aria-label="Cargando catálogo"
    >
      <div className="skeleton skeleton-heading" />
      <div className="catalog-grid">
        {Array.from({ length: 6 }, (_, i) => (
          <div className="skeleton skeleton-poster" key={i} />
        ))}
      </div>
    </main>
  );
}
