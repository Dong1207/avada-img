import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

export default defineConfig({
  // Vite automatically loads .env files and exposes VITE_* variables
  // No need to define them manually
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Xóa console.log
        drop_debugger: true, // Xóa debugger
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Xóa các hàm console
        passes: 3, // Chạy nhiều lần để compress tốt hơn
      },
      mangle: {
        toplevel: true, // Obfuscate biến global
        properties: {
          regex: /^_/, // Obfuscate properties bắt đầu bằng _
        },
      },
      format: {
        comments: false, // Xóa comments
        beautify: false, // Không format lại code
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Minify tên file
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
      },
    },
    cssMinify: 'esbuild', // Minify CSS (esbuild is built-in, no extra dependency needed)
    cssCodeSplit: false, // Không split CSS
  },
  plugins: [
    {
      name: 'copy-redirects',
      closeBundle() {
        // Copy _redirects file to dist (only in build mode)
        if (process.env.NODE_ENV === 'production' || process.argv.includes('build')) {
          try {
            const redirectsPath = resolve(__dirname, '_redirects');
            const distPath = resolve(__dirname, 'dist');
            const destPath = resolve(distPath, '_redirects');
            
            // Check if _redirects file exists
            if (!existsSync(redirectsPath)) {
              console.warn('_redirects file not found, skipping copy');
              return;
            }
            
            // Ensure dist directory exists
            if (!existsSync(distPath)) {
              mkdirSync(distPath, { recursive: true });
            }
            
            // Copy file
            copyFileSync(redirectsPath, destPath);
            console.log('✓ Copied _redirects to dist');
          } catch (err) {
            console.warn('Could not copy _redirects file:', err.message);
          }
        }
      },
    },
  ],
  server: {
    port: 3000,
  },
});
