import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'antd',
      'react',
      'react-dom',
      'react-router-dom',
      '@ant-design/icons',
      'axios',
      'moment',
      'dayjs',
      'lodash',
    ],
  },
})