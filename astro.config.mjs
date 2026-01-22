// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [
    tailwind(),
    react()
  ],
  vite: {
    ssr: {
      noExternal: ['@supabase/supabase-js']
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: '[name].mjs',
          chunkFileNames: '[name].[hash].mjs',
          assetFileNames: '[name].[hash][extname]'
        }
      }
    }
  },
  // Deshabilitar validación CSRF para permitir formularios POST en producción
  security: {
    checkOrigin: false
  },
  // Configuración adicional para Astro 5+
  env: {
    schema: {}
  }
});
