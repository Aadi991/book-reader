import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // base: './' ensures all asset paths are relative — required for
  // Electron (file:// protocol) and Capacitor (Android WebView) in production.
  base: process.env.VITE_PACKAGED === 'true' ? './' : '/',
  server: { port: 5173 },
  plugins: [react(), tailwindcss()],
})
