import { defineConfig, loadEnv, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Reads .env, .env.[mode] and .env.local from the frontend folder (only VITE_* keys).
  const env = loadEnv(mode, '.');
  const apiUrl = env.VITE_API_URL;

  const config = {
    plugins: [react(), tailwindcss()],
    base: env.VITE_SITE_BASENAME || '/',
    build: {
      outDir: 'build',
      rollupOptions: {
        output: {
          // T046: React + router in a long-cached vendor chunk, shared by every route chunk.
          manualChunks: (id: string): string | undefined =>
            /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|@remix-run[\\/]router)[\\/]/.test(id)
              ? 'vendor-react'
              : undefined,
        },
      },
    },
    server: {
      port: 3000,
      // Same paths the app calls when VITE_API_URL is empty (same origin): REST and GraphQL.
      proxy: apiUrl
        ? {
            '/api': {
              target: apiUrl,
              changeOrigin: true,
              secure: false,
            },
            '/graphql': {
              target: apiUrl,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
    preview: {
      port: 3000,
    },
    // Vitest options. Kept in a plain object (not a literal passed to UserConfig)
    // so the typecheck does not depend on the vitest module augmentation.
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      globals: true,
      css: true,
    },
  };

  return config as UserConfig;
});
