import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PinAuthProvider } from "@/hooks/usePinAuth";
import { SettingsProvider } from "@/hooks/useSettings";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Detectar si estamos en GitHub Pages o en Local
const basename = window.location.hostname.includes("github.io") 
  ? "/CalendarioSJT" 
  : "/";

const App = () => (
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

export default App;