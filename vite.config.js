import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from "fs";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ command, isSsrBuild }) => {
  const isDev = command === "serve";

  return {
    plugins: [
      react({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      })
    ],

    esbuild: {
      jsxDev: false,
    },
    build: isSsrBuild
      ? {
        ssr: true,
        outDir: "dist/ssr",
        rollupOptions: {
          input: "src/ssr/entry-ssr.jsx",
          output: {
            format: "esm",
          },
          plugins: [
            {
              name: "copy-static-files",
              writeBundle() {
                const files=["template.html","template.css"];
                files.forEach( f=>{
                  const src = path.resolve(`src/ssr/${f}`);
                  const dest = path.resolve(`dist/ssr/${f}`);
                  fs.copyFileSync(src, dest);
                });

              },
            },
          ],
        },
      }
      : {
        // CSR ビルド
        outDir: "dist/csr",
        manifest: "manifest.json",
      },
    ssr: isDev
      ? {
        // 開発時 SSR
        external: ["react", "react-dom"],
      }
      : {
        // 本番 SSR ビルド
        // → react / react-dom をバンドルに含める
        noExternal: [
          "react",
          "react-dom",
        ],
      },
  }
});
