import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin.html'),
        worker: resolve(import.meta.dirname, 'worker.html'),
        about: resolve(import.meta.dirname, 'about-us.html'),
        contact: resolve(import.meta.dirname, 'contact-us.html'),
        terms: resolve(import.meta.dirname, 'terms.html'),
        privacy: resolve(import.meta.dirname, 'privacy-policy.html'),
        refund: resolve(import.meta.dirname, 'refund-policy.html'),
        shipping: resolve(import.meta.dirname, 'shipping-policy.html'),
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  define: {
    // Expose Razorpay key ID to frontend (never the secret)
    'import.meta.env.VITE_RAZORPAY_KEY_ID': JSON.stringify('rzp_live_TtGrq3sfJkM0pA'),
  }
})
