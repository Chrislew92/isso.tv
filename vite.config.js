import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 20_000,
          groups: [
            {
              name: 'three-runtime',
              test: /[\\/]node_modules[\\/]three[\\/]/,
              maxSize: 260_000,
              priority: 40,
            },
            {
              name: 'react-three',
              test: /[\\/]node_modules[\\/]@react-three[\\/]/,
              maxSize: 260_000,
              priority: 35,
            },
            {
              name: 'three-addons',
              test: /[\\/]node_modules[\\/](three-stdlib|suspend-react|zustand)[\\/]/,
              maxSize: 220_000,
              priority: 30,
            },
            {
              name: 'react-runtime',
              test: /[\\/]node_modules[\\/]react(-dom)?[\\/]/,
              maxSize: 220_000,
              priority: 25,
            },
          ],
        },
      },
    },
  },
})
