import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        scene: resolve(__dirname, 'scene.html')
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'ec2-13-244-137-123.af-south-1.compute.amazonaws.com',
      'localhost',
      '127.0.0.1',
      '.amazonaws.com',
      'tevlen.co.za'
    ]
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all'
  }
})