import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // base: './' ensures all asset paths are relative — required for
  // Electron (file:// protocol) and Capacitor (Android WebView).
  base: './',
  server: { port: 5173 },
  plugins: [react(), tailwindcss()],
})
