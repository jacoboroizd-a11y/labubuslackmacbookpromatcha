"use client";
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="es">
      <body
        style={{
          background: "#101214",
          color: "#eee",
          fontFamily: "system-ui",
          padding: "10vw",
        }}
      >
        <h1>No se pudo cargar Frame</h1>
        <p>
          Revisa tu conexión y la configuración de Supabase. Tus datos guardados
          no se han modificado.
        </p>
        <button onClick={reset}>Volver a intentar</button>
      </body>
    </html>
  );
}
