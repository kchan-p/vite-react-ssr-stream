import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig(({ command, isSsrBuild }) => {
  const isDev = command === "serve";

  return {
    plugins: [
      react({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
      viteStaticCopy({
        targets: [
          {
            src: [
              "src/ssr/template.html",
              "src/ssr/template.css"
            ],
            dest: "",
          },
        ],
        environment: "ssr"
      }),
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
        },
      }
      : {
        // CSR ビルド
        outDir: "dist/csr",
        manifest: "manifest.json",
        rollupOptions: {
          input: "src/csr/csr.html"
        }
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
