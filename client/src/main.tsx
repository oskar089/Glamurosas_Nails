import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./pages";
import "./styles.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("No se encontró el elemento raíz #root");
}

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
