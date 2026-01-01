import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    ...(process.env.TEST_BACKEND_URL && {
      'process.env.TEST_BACKEND_URL': JSON.stringify(process.env.TEST_BACKEND_URL),
    }),
  },
});
