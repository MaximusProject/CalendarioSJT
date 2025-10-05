import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
<<<<<<< HEAD
  base: "/CalendarioSJT/",
=======
  base: "/CalendarioSJT/",  // ← AÑADE LA BARRA AL FINAL
>>>>>>> 806ce752b2ffd01196fc27e4e10850998b243736
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
<<<<<<< HEAD
  // ✅ AÑADE ESTA SECCIÓN BUILD PARA ANTI-CACHE
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  }
=======
>>>>>>> 806ce752b2ffd01196fc27e4e10850998b243736
}));