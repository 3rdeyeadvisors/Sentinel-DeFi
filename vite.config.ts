import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// PWA / vite-plugin-pwa was intentionally removed.
//
// It was caching index.html and pinning returning users to old chunk
// hashes, producing "Importing a module script failed" errors after
// every deploy. A static kill-switch worker now lives at
// /public/sw.js (and /public/service-worker.js) to clean up any
// previously-installed worker on returning devices.

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false,
  },
  assetsInclude: ['**/*.xml'],
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            'lucide-react'
          ],
          'vendor-web3': ['thirdweb', 'viem', 'wagmi', '@rainbow-me/rainbowkit'],
          'vendor-charts': ['recharts'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-motion': ['framer-motion'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge', 'zod']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
