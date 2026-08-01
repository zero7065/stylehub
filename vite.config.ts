import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['icons/*.svg'],
        manifest: {
          name: 'StyleHub - Digital Marketplace',
          short_name: 'StyleHub',
          description: 'Digital marketplace, OPay transfers, and points economy platform',
          start_url: '/',
          display: 'standalone',
          background_color: '#0a0a0f',
          theme_color: '#00b894',
          orientation: 'portrait',
          lang: 'en',
          scope: '/',
          categories: ['finance', 'business', 'lifestyle'],
          screenshots: [
            { src: '/icons/screenshot-1.svg', sizes: '1080x1920', type: 'image/svg+xml', form_factor: 'narrow' },
          ],
          shortcuts: [
            { name: 'Dashboard', url: '/', description: 'View dashboard' },
            { name: 'OPay Transfer', url: '/', description: 'Send money via OPay' },
            { name: 'Buy Points', url: '/', description: 'Purchase points packages' },
            { name: 'Shop', url: '/', description: 'Browse marketplace' },
          ],
          icons: [
            { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
            { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
          runtimeCaching: [
            {
              urlPattern: /^https?:\/\/localhost:3000\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
     server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});