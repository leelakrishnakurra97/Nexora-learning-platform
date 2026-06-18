import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const pdfRedirectPlugin = () => ({
  name: 'pdf-redirect',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url ? req.url.split('?')[0] : '';
      const hasDownload = req.url && req.url.includes('download=true');
      if (url.endsWith('.pdf') && !url.includes('/assignment/') && !hasDownload) {
        const secFetchDest = req.headers['sec-fetch-dest'];
        const referer = req.headers['referer'];
        
        // Intercept direct navigation to raw PDF file and redirect to secure notes route
        if (secFetchDest === 'document' || (!secFetchDest && !referer)) {
          res.writeHead(302, { Location: `/#/secure-note-preview?pdf=${encodeURIComponent(req.url || '')}` });
          res.end();
          return;
        }
      }
      next();
    });
  }
});

export default defineConfig({
  plugins: [react(), pdfRedirectPlugin()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      }
    }
  },
});
