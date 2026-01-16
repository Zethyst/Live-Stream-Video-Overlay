import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          'hls': ['hls.js'],
          'draggable': ['react-draggable', 're-resizable'],
          'ui': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})