import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Frontend will call: /proxy/tenso/api/en/estimate
      '/proxy/tenso': {
        target: 'https://www.tenso.com',
        changeOrigin: true,
        secure: true,
        // Make the upstream think the Origin is tenso.com
        headers: { Origin: 'https://www.tenso.com' },
        rewrite: (path) => path.replace(/^\/proxy\/tenso/, ''),
      },
    },
  },
})
