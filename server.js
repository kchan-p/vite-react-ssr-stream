import express from "express";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

process.env.NODE_ENV ??= "production";
const isProd = process.env.NODE_ENV === "production";

const app = express();
const root = process.cwd();

const loadTemplate = (root, isProd) => {
    const templatePath = path.join(
        root, isProd ? "dist" : "src", "ssr/template");
    const template = fs.readFileSync(templatePath + ".html", "utf-8");
    const css = fs.readFileSync(templatePath + ".css", "utf-8");
    return template.replace("<!--template.css-->", `<style>${css}</style>`);
};

const render = await (async () => {

    const SCRIPT_PRD = "<!--scripts1-->";
    const SCRIPT_DEV = "<!--scripts2-->";
    const STYLES = "<!--styles-->";

    if (isProd) {

        /**
         * 本番環境
         */
        app.use(
            "/assets",
            express.static(path.join(root, "dist/csr/assets"))
        );

        // manifest.jsonからビルド後のスクリプトファイル名を取得
        const manifest = JSON.parse(
            fs.readFileSync("dist/csr/manifest.json")
        )["src/csr/csr.html"];

        const template = loadTemplate(root, isProd)
            .replace(SCRIPT_PRD, `<script type="module" crossorigin src="/${manifest.file}"></script>`)
            .replace(SCRIPT_DEV, "")
            .replace(STYLES, manifest["css"].map(
                css => `<link rel="stylesheet" crossorigin href="/${css}">`
            ).join(""));

        const importModule = await import(
            pathToFileURL(path.join(root, "dist/ssr/entry-ssr.js")).href
        );

        const render = (res) => {
            return importModule.default(res, template);
        };
        return render;
    }

    /**
     * 開発環境
     */
    const { createServer } = await import("vite");

    const vite = await createServer({
        server: { middlewareMode: true },
        appType: "custom",
    });

    app.use(vite.middlewares);

    const template = async (url) => {
        const rawTemplate = loadTemplate(root, isProd)
            .replace(SCRIPT_PRD, "")
            .replace(SCRIPT_DEV, `<script type="module" src="/src/csr/entry-csr.jsx"></script>`)
            .replace(STYLES, "");
        return await vite.transformIndexHtml(url, rawTemplate);
    };
    const render = async (res, url) => {
        const importModule = await vite.ssrLoadModule("/src/ssr/entry-ssr.jsx");
        importModule.default(res, await template(url));
    };
    return render;
})();

app.use(async (req, res) => {

    try {
        render(res, req.originalUrl);
    } catch (e) {
        console.error(e);
        res.status(500).end("Internal Server Error");
    }
});

app.listen(3000, () => {
    console.log(`Server running: http://localhost:3000`);
});