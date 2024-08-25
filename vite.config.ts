import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

const ENV_PREFIX = ['VITE_']

export default defineConfig(() => ({
  envPrefix: ENV_PREFIX,
  server: { port: 4001, host: false },
  assetsInclude: ["**/*.glb"],
  define: {
    'process.env.ANCHOR_BROWSER': true,
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      '@': path.resolve(__dirname, './src')  // Add this line
    },
  },
  plugins: [
    react({ jsxRuntime: 'classic' }),
  ],
}))
