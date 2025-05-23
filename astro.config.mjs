// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import path from "path";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [
    react({
      include: ['**/*.tsx', '**/*.jsx'],
    }), 
    sitemap()
  ],
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
      include: ['react', 'react-dom'],
    },
    cacheDir: './node_modules/.vite'  // Set a valid path instead of null
  },
  adapter: node({ mode: 'standalone' })
});
