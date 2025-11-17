import {defineConfig} from "vite";
import {resolve} from "path";
import {copyFileSync, existsSync, mkdirSync, cpSync} from "fs";

export default defineConfig({
  // Vite automatically loads .env files and exposes VITE_* variables
  // No need to define them manually
  build: {
    outDir: "dist",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Xóa console.log
        drop_debugger: true, // Xóa debugger
        pure_funcs: ["console.log", "console.info", "console.debug"], // Xóa các hàm console
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
        main: resolve(__dirname, "index.html"),
      },
      output: {
        // Minify tên file
        entryFileNames: "assets/[hash].js",
        chunkFileNames: "assets/[hash].js",
        assetFileNames: "assets/[hash].[ext]",
      },
    },
    cssMinify: "esbuild", // Minify CSS (esbuild is built-in, no extra dependency needed)
    cssCodeSplit: false, // Không split CSS
  },
  plugins: [
    {
      name: "copy-files",
      closeBundle() {
        // Copy files to dist (only in build mode)
        if (
          process.env.NODE_ENV === "production" ||
          process.argv.includes("build")
        ) {
          const distPath = resolve(__dirname, "dist");

          // Ensure dist directory exists
          if (!existsSync(distPath)) {
            mkdirSync(distPath, {recursive: true});
          }

          // Copy functions/ folder
          try {
            const functionsPath = resolve(__dirname, "functions");
            const destFunctionsPath = resolve(distPath, "functions");

            if (existsSync(functionsPath)) {
              cpSync(functionsPath, destFunctionsPath, {recursive: true});
              console.log("✓ Copied functions/ to dist");
            }
          } catch (err) {
            console.warn("Could not copy functions/:", err.message);
          }

          // Copy _routes.json
          try {
            const routesPath = resolve(__dirname, "_routes.json");
            const destRoutesPath = resolve(distPath, "_routes.json");

            if (existsSync(routesPath)) {
              copyFileSync(routesPath, destRoutesPath);
              console.log("✓ Copied _routes.json to dist");
            }
          } catch (err) {
            console.warn("Could not copy _routes.json:", err.message);
          }
        }
      },
    },
  ],
  server: {
    port: 3000,
  },
});
