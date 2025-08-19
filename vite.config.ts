import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// REMOVED: import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // REMOVED: mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add environment variable definitions
  define: {
    __DEV__: mode === 'development',
    __PROD__: mode === 'production',
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUILD_MODE__: JSON.stringify(mode),
  },
  // Optimize build for your domain
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
}));
