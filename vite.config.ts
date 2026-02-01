import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  
  return {
    server: {
      host: "localhost", // Cambiado a localhost para Windows
      port: 8080,
      strictPort: true, // Evita que Vite cambie el puerto
      // Configuración específica para Windows y React Router
      fs: {
        strict: false,
        allow: ['..'], // Permitir servir archivos fuera de root
      },
      // IMPORTANTE: Para evitar conflictos con React Router en Windows
      middlewareMode: false,
      // Deshabilitar HMR si hay problemas
      hmr: {
        clientPort: 8080,
      },
    },
    
    // Base path para producción/desarrollo
    base: isProduction ? "/CalendarioSJT/" : "/",
    
    plugins: [
      react({
        // Configuración específica para evitar problemas en Windows
        devTarget: 'es2022',
      }), 
      mode === "development" && componentTagger()
    ].filter(Boolean),
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      // Extensions para Windows
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    },
    
    build: {
      outDir: "dist",
      sourcemap: mode === "development",
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          // Optimizar para Windows
          manualChunks: undefined,
        },
        // Plugins para manejar rutas en Windows
        onwarn(warning, warn) {
          // Ignorar warnings específicos de Windows
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
      },
      // Configuración para Windows
      target: "es2022",
      minify: isProduction ? 'terser' : false,
      // Tamaño de chunks para Windows
      chunkSizeWarningLimit: 1000,
      // Limpiar output directory
      emptyOutDir: true,
    },
    
    // Optimización de dependencias
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'react-router-dom',
        '@tanstack/react-query'
      ],
      esbuildOptions: {
        charset: 'utf8',
        target: 'es2022',
        // Configuración específica para Windows
        platform: 'neutral',
      },
    },
    
    // Configuración del preview server
    preview: {
      port: 4173,
      host: 'localhost',
    },
    
    // Configuración para desarrollo en Windows
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    
    // Configuración de cache para Windows
    cacheDir: `node_modules/.vite-${mode}`,
  };
});