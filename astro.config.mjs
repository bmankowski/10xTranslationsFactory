// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { 
    port: 3000,
    host: true  // This ensures binding to all network interfaces (0.0.0.0)
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        strict: false,  // Umożliwia dostęp do plików poza katalogiem projektu
      },
      watch: {
        usePolling: true
      },
      hmr: {
        clientPort: 3000,  // Zapewnia działanie HMR w kontenerze
      }
    },
    build: {
      modulePreload: false,
      cssCodeSplit: false
    },
    clearScreen: false,  // Usuwa zbędne komunikaty na ekranie
    optimizeDeps: {
      disabled: true,  // Wyłącza optymalizację zależności (jeśli to konieczne)
    },
    cacheDir: null
  }
  
});
