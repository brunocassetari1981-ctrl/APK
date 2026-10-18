import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'file-download-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url) {
            if (req.url.endsWith('.apk') || req.url.includes('FortuneGo.apk')) {
              res.setHeader('Content-Type', 'application/vnd.android.package-archive');
              res.setHeader('Content-Disposition', 'attachment; filename="FortuneGo.apk"');
              res.setHeader('Access-Control-Allow-Origin', '*');
            } else if (req.url.endsWith('.zip') || req.url.includes('FortuneGo-APK-Package.zip')) {
              res.setHeader('Content-Type', 'application/zip');
              res.setHeader('Content-Disposition', 'attachment; filename="FortuneGo-APK-Package.zip"');
              res.setHeader('Access-Control-Allow-Origin', '*');
            }
          }
          next();
        });
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});
