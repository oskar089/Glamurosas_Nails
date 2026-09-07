import { Link } from "react-router-dom";
import { Arrow } from "./components/ui";

export function AppErrorFallback() {
  return (
    <section className="not-found container" role="alert">
      <p className="eyebrow">ALGO SE INTERRUMPIÓ</p>
      <h1>
        Un pequeño tropiezo.
        <br />
        <em>Nada que tu próxima visita no pueda arreglar.</em>
      </h1>
      <p>
        Algo salió mal al mostrar esta página. Vuelve al inicio para seguir
        explorando la inspiración.
      </p>
      <Link className="button" to="/">
        Volver al inicio <Arrow />
      </Link>
    </section>
  );
}
