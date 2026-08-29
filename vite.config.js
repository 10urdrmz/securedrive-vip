import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: false
    },
    preview: {
      port: 3000,
      strictPort: false
    },
    build: {
      sourcemap: false,
      minify: 'esbuild',
      cssMinify: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Sadece hash — admin/driver gibi isimler URL'de görünmez
          entryFileNames: 'assets/[hash].js',
          chunkFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash][extname]',
          manualChunks(id) {
            if (id.includes('/src/components/admin/')) {
              return 'a';
            }
            if (id.includes('node_modules')) {
              if (id.includes('leaflet')) return 'm';
              if (id.includes('@supabase')) return 's';
              return 'v';
            }
            return undefined;
          }
        }
      }
    },
    esbuild: isProd
      ? {
          drop: ['console', 'debugger'],
          legalComments: 'none'
        }
      : undefined
  };
});
