import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        port: 5173,
        proxy: {
            '/generate': 'http://127.0.0.1:3000',
        },
    },
    plugins: [react()],
});
