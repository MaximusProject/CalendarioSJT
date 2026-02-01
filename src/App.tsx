import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PinAuthProvider } from "@/hooks/usePinAuth";
import { SettingsProvider } from "@/hooks/useSettings";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react"; // IMPORTANTE: Agregar este import

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Detectar si estamos en GitHub Pages o en Local
const basename = window.location.hostname.includes("github.io") 
  ? "/CalendarioSJT" 
  : "/";

const App = () => {
  // Efecto para asegurar encoding UTF-8 en toda la aplicación
  useEffect(() => {
    // Forzar charset UTF-8
    const metaCharset = document.querySelector('meta[charset]');
    if (metaCharset) {
      metaCharset.setAttribute('charset', 'UTF-8');
    } else {
      const newMeta = document.createElement('meta');
      newMeta.setAttribute('charset', 'UTF-8');
      document.head.appendChild(newMeta);
    }

    // Asegurar lang="es"
    document.documentElement.setAttribute('lang', 'es');

    // Agregar meta tag de content-type si no existe
    let metaContentType = document.querySelector('meta[http-equiv="Content-Type"]');
    if (!metaContentType) {
      metaContentType = document.createElement('meta');
      metaContentType.setAttribute('http-equiv', 'Content-Type');
      metaContentType.setAttribute('content', 'text/html; charset=UTF-8');
      document.head.appendChild(metaContentType);
    }

    // Depurar encoding si es necesario
    if (process.env.NODE_ENV === 'development') {
      console.log('Encoding verificado: UTF-8');
      console.log('Lang:', document.documentElement.lang);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <PinAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={basename}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PinAuthProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
};

export default App;