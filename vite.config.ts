import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true,
      interval: 1000
    }
  },
  plugins: [react()],
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
  // Optimize build for NexaCore domain
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
