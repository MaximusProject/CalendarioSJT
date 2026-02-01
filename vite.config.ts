import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Importar terser para minificación
import terser from "terser";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  
  return {
    server: {
      host: "localhost",
      port: 8080,
      strictPort: true,
      fs: {
        strict: false,
        allow: ['..'],
      },
      middlewareMode: false,
      hmr: {
        clientPort: 8080,
      },
    },
    
    base: isProduction ? "/CalendarioSJT/" : "/",
    
    plugins: [
      react({
        devTarget: 'es2022',
      }), 
      mode === "development" && componentTagger()
    ].filter(Boolean),
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    },
    
    build: {
      outDir: "dist",
      sourcemap: mode === "development",
      minify: isProduction ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: isProduction, // Eliminar console.log en producción
          drop_debugger: true,
        },
        format: {
          comments: false,
          ascii_only: false, // IMPORTANTE: Permitir caracteres no ASCII
        },
        // Configuración específica para evitar errores
        mangle: {
          properties: false,
        },
      },
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          manualChunks: undefined,
        },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
      },
      target: "es2022",
      chunkSizeWarningLimit: 1000,
      emptyOutDir: true,
      // Configuración para optimizar el build
      cssCodeSplit: true,
      reportCompressedSize: false,
    },
    
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
        platform: 'neutral',
      },
    },
    
    preview: {
      port: 4173,
      host: 'localhost',
    },
    
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    
    cacheDir: `node_modules/.vite-${mode}`,
  };
});