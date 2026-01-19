import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { viteSourceLocator } from '@metagptx/vite-plugin-source-locator';
import terser from '@rollup/plugin-terser';
// Load environment variables for Dify and Stripe configuration

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      viteSourceLocator({
        prefix: 'mgx',
      }),
      react(),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
            'supabase': ['@supabase/supabase-js'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      middlewareMode: false,
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '169.254.0.21',
        '.manus.computer',
        '.us1.manus.computer',
      ],
      watch: { usePolling: true, interval: 800 /* 300~1500 */ },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY),
      'import.meta.env.VITE_DIFY_API_URL': JSON.stringify(env.VITE_DIFY_API_URL),
      'import.meta.env.VITE_RADAR_API_KEY_FREE': JSON.stringify(env.VITE_RADAR_API_KEY_FREE),
      'import.meta.env.VITE_RADAR_API_KEY_PAID': JSON.stringify(env.VITE_RADAR_API_KEY_PAID),
    },
  };
});