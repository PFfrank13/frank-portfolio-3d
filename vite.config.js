import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`        → dist/ normal (para Vercel, Netlify, etc.)
// `npm run build:single` → dist-single/index.html: UN solo archivo que abre con doble clic.
export default defineConfig(({ mode }) => {
const single = mode === 'single' || process.env.SINGLE === '1';
return {
  base: './',
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  assetsInclude: ['**/*.pdf', '**/*.glb'],
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'framer-motion', 'gsap', 'lenis', 'lucide-react', 'simple-icons',
      'three', 'meshline', '@react-three/fiber', '@react-three/drei', '@react-three/rapier',
      '@supabase/supabase-js',
    ],
  },
  build: {
    outDir: single ? 'dist-single' : 'dist',
    assetsInlineLimit: single ? 100_000_000 : 4096,
    cssCodeSplit: !single,
    chunkSizeWarningLimit: 4000,
    // Sin manualChunks: separar React en trozos propios rompía el sitio compilado (React quedaba sin definir).
  },
};
});
