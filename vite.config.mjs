import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/paydesk/',
  plugins: [react()],
  // Vite with @vitejs/plugin-react handles JSX files automatically.
})
