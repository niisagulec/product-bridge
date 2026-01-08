import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  // Sandbox/CI: node_modules altına yazmayı engelleyen ortamlarda hata almamak için
  // cache/temp dosyalarını proje içine alıyoruz.
  cacheDir: 'vite-cache',
  plugins: [react()],
});
