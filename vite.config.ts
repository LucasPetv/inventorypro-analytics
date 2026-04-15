import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode, command }) => {
    const env = loadEnv(mode, '.', '');
    
    // GitHub Pages base path
    const isGitHubPagesBuild = process.env.npm_lifecycle_event === 'build-gh-pages';
    const base = isGitHubPagesBuild ? '/inventorypro-analytics/' : '/';
    
    console.log('Build mode:', mode, 'Command:', command, 'Base:', base);
    
    return {
      base: base,
      server: {
        port: 5174,
        host: '0.0.0.0',
        strictPort: true,
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html')
          },
          external: ['mysql2', 'mysql2/promise', 'bcryptjs', 'jsonwebtoken', 'crypto'] // Externalize Node.js modules for browser
        }
      },
      plugins: [react()],
      css: {
        postcss: {
          plugins: [tailwindcss, autoprefixer],
        },
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        global: 'globalThis', // Browser compatibility
        'process.env.NODE_ENV': JSON.stringify(mode)
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
