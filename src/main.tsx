import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@/config/encoding"; // Importar configuración de encoding

// Configurar encoding antes de renderizar
if (typeof document !== 'undefined') {
  document.documentElement.lang = 'es';
  
  // Forzar UTF-8 en meta tags
  const metaCharset = document.querySelector('meta[charset]');
  if (metaCharset) {
    metaCharset.setAttribute('charset', 'UTF-8');
  }
}

createRoot(document.getElementById("root")!).render(<App />);