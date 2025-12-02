import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000/', // ✅ HTTPS backend  //https://onexhib-backend.vercel.app
        changeOrigin: true,              // ✅ Changes host header to match target
        secure: false,                    // ✅ Verify SSL cert (set false if self-signed)
      },
    },
  }, 
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
