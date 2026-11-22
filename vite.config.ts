import { defineConfig, loadEnv, type Plugin } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join, extname } from "node:path";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

// Dev-only stand-in for the Nginx `/uploads/` alias that serves admin
// image uploads in production (see deploy/nginx/yashfaa-clinic.uz.conf).
function devUploadsPlugin(): Plugin {
  return {
    name: "dev-uploads-static",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/uploads/")) return next();
        const uploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), "uploads");
        const relPath = decodeURIComponent(req.url.slice("/uploads/".length));
        const filePath = join(uploadsDir, relPath);
        if (!filePath.startsWith(uploadsDir) || relPath.includes("..")) return next();
        try {
          await stat(filePath);
          res.setHeader("Content-Type", MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream");
          createReadStream(filePath).pipe(res);
        } catch {
          next();
        }
      });
    },
  };
}

export default defineConfig(async ({ mode, command }) => {
  const viteEnv = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine = Object.fromEntries(
    Object.entries(viteEnv).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)])
  );

  return {
    define: envDefine,
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
    server: { host: "::", port: 8080 },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
      }),
      ...(command === "build"
        ? [(await import("nitro/vite")).nitro({ preset: "node-server" })]
        : []),
      viteReact(),
      devUploadsPlugin(),
    ],
  };
});
