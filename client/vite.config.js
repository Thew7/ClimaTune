// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // ✅ FIX: Explicitly set the server host to listen on all interfaces
    host: true, 
    
    proxy: {
      '/spotify-token': {
        // ✅ FIX: Change the target to the official Spotify Accounts API host
        target: 'https://accounts.spotify.com', 
        changeOrigin: true, 
        // ✅ FIX: Rewrite the path to the correct Spotify endpoint
        rewrite: (path) => path.replace('/spotify-token', '/api/token'),
        secure: true, 
      },
    },
  },
});