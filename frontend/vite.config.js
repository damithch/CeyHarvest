import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080', // Try with 127.0.0.1 instead of localhost
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSockets
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            console.log('Proxy Request:', proxyReq.path);
          });
        }
      },
    },
  },
});