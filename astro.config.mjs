// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://fashionforcestore.victoriafp.online',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    tailwind(),
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/api/') &&
        !page.includes('/debug/') &&
        !page.includes('/checkout/') &&
        !page.includes('/cuenta/callback') &&
        !page.includes('/cuenta/nueva-password'),
      changefreq: 'weekly',
      priority: 0.7,
      customPages: [
        'https://fashionforcestore.victoriafp.online/',
        'https://fashionforcestore.victoriafp.online/productos',
        'https://fashionforcestore.victoriafp.online/categoria/novedades',
        'https://fashionforcestore.victoriafp.online/categoria/ofertas',
        'https://fashionforcestore.victoriafp.online/contacto',
        'https://fashionforcestore.victoriafp.online/sobre-nosotros',
        'https://fashionforcestore.victoriafp.online/envios',
        'https://fashionforcestore.victoriafp.online/terminos',
        'https://fashionforcestore.victoriafp.online/privacidad',
      ],
    }),
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
