import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/teamwork-indicator/',
  plugins: [tailwindcss()],
  build: {
    outDir: 'build',
  },
});