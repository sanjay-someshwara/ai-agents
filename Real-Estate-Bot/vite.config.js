import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: [
        '*'
    ],
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
