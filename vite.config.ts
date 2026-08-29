import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
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
    'import.meta.env.VITE_RAZORPAY_KEY_ID': JSON.stringify('rzp_test_TVd0zW6feQlmUb'),
  }
})
