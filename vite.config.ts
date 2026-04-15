import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'path';

export default defineConfig(({ mode }) => {
  // GitHub Pages base path
  const isGitHubPagesBuild = process.env.npm_lifecycle_event === 'build-gh-pages';
  const base = isGitHubPagesBuild ? '/inventorypro-analytics/' : '/';
  
  return {
    base: base,
    plugins: [react()],
    server: {
      port: 5174,
      host: '0.0.0.0',
      strictPort: true,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      global: 'globalThis',
    },
    resolve: {
      alias: {
          '@': path.resolve(__dirname, '.'),
          '@features': path.resolve(__dirname, 'src/features'),
          '@shared': path.resolve(__dirname, 'src/shared'),
          '@config': path.resolve(__dirname, 'src/config'),
          // Browser-Fallbacks für Node.js Module
          'crypto': 'crypto-browserify',
          'util': 'util',
          'buffer': 'buffer',
        }
      },
      optimizeDeps: {
        exclude: ['mysql2', 'mysql2/promise', 'bcryptjs', 'jsonwebtoken'] // Don't try to optimize Node.js modules
      }
    };
});
