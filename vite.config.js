import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), 
    {
      name: 'rename-index-to-stage',
      closeBundle() {
        // After the build is complete, rename index.html to stage.html
        const indexPath = resolve(__dirname, 'dist/index.html')
        const stagePath = resolve(__dirname, 'dist/stage.html')
        
        if (fs.existsSync(indexPath)) {
          fs.renameSync(indexPath, stagePath)
        }
      }
    }
  ],
  base: './', // Use relative paths for assets
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
})
