import { defineConfig } from "vitepress";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { extname, resolve } from "node:path";
import type { Plugin } from "vite";

const DOCS_HOSTNAME = "https://docs.toastflow.top";
const OG_IMAGE =
  "https://raw.githubusercontent.com/adrianjanocko/toastflow/main/images/banner.png";

type PackageJson = {
  version?: string;
};

function readPackageVersion(
  packageJsonCandidates: string[],
  fallback: string,
): string {
  const cwd = process.cwd();
  const candidatePaths = packageJsonCandidates.map((candidate) =>
    resolve(cwd, candidate),
  );

  for (const packageJsonPath of candidatePaths) {
    if (!existsSync(packageJsonPath)) {
      continue;
    }

    try {
      const packageJsonRaw = readFileSync(packageJsonPath, "utf8");
      const packageJson = JSON.parse(packageJsonRaw) as PackageJson;

      if (
        typeof packageJson.version === "string" &&
        packageJson.version.trim()
      ) {
        return packageJson.version;
      }
    } catch (error) {
      console.warn(
        `[toastflow-docs] Failed to read package version from ${packageJsonPath}`,
        error,
      );
    }
  }

  console.warn(
    `[toastflow-docs] Could not locate a package version in: ${candidatePaths.join(
      ", ",
    )}`,
  );
  return fallback;
}

const TOASTFLOW_CORE_VERSION = readPackageVersion(
  ["../../core/package.json", "packages/core/package.json"],
  "latest",
);
const VUE_TOASTFLOW_VERSION = readPackageVersion(
  ["../../vue/package.json", "packages/vue/package.json"],
  "latest",
);

function resolveCanonicalUrl(page: string): string {
  const normalizedPage = page.replace(/\\/g, "/");
  const pathname =
    normalizedPage === "index.md"
      ? "/"
      : "/" + normalizedPage.replace(/\.md$/, "");

  return new URL(pathname, DOCS_HOSTNAME).toString();
}

const isLocalDev = process.env.NODE_ENV !== "production";

/**
 * Vite plugin that serves local dist/ builds at /@toastflow-local/*
 * so the Vue REPL can load them without a published npm version.
 * Only active in dev mode (vitepress dev).
 */
function toastflowLocalDevPlugin(): Plugin {
  const coreDistDir = resolve(process.cwd(), "../../core/dist");
  const vueDistDir = resolve(process.cwd(), "../../vue/dist");

  const prefixes: Record<string, string> = {
    "/@toastflow-local/core/": coreDistDir,
    "/@toastflow-local/vue/": vueDistDir,
  };

  const mimeTypes: Record<string, string> = {
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".map": "application/json",
  };

  return {
    name: "toastflow-local-dev",
    apply: "serve",
    configureServer(server) {
      console.log(
        "\n  [toastflow] Local dev mode — live examples load from local dist/",
        '\n  Run "pnpm build" in core + vue if previews look stale.\n',
      );

      server.middlewares.use(function (req, res, next) {
        const url = req.url ?? "";

        for (const [prefix, baseDir] of Object.entries(prefixes)) {
          if (!url.startsWith(prefix)) {
            continue;
          }

          const relativePath = url.slice(prefix.length).split("?")[0];
          const filePath = resolve(baseDir, relativePath);

          if (
            !filePath.startsWith(baseDir) ||
            !existsSync(filePath) ||
            !statSync(filePath).isFile()
          ) {
            return next();
          }

          const ext = extname(filePath);
          res.setHeader(
            "Content-Type",
            mimeTypes[ext] ?? "application/octet-stream",
          );
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Cache-Control", "no-cache");
          createReadStream(filePath).pipe(res);
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  title: "Toastflow",
  description:
    "Toast engine for Vue 3 and Nuxt. Typed core, smooth animations, CSS-first theming, and full layout control.",
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: DOCS_HOSTNAME,
  },
  head: [
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon-96x96.png",
        sizes: "96x96",
      },
    ],
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    ["link", { rel: "shortcut icon", href: "/favicon.ico" }],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
    ["meta", { name: "apple-mobile-web-app-title", content: "Toastflow" }],
    ["link", { rel: "manifest", href: "/site.webmanifest" }],
    ["meta", { name: "theme-color", content: "#0ea5e9" }],
    ["meta", { name: "robots", content: "index,follow" }],
    ["meta", { property: "og:site_name", content: "Toastflow Docs" }],
    ["meta", { property: "og:type", content: "website" }],
    [
      "meta",
      {
        property: "og:image",
        content: OG_IMAGE,
      },
    ],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    [
      "meta",
      {
        name: "twitter:image",
        content: OG_IMAGE,
      },
    ],
  ],
  transformHead: (ctx) => {
    const canonicalUrl = resolveCanonicalUrl(ctx.page);

    return [
      ["link", { rel: "canonical", href: canonicalUrl }],
      ["meta", { property: "og:url", content: canonicalUrl }],
      ["meta", { property: "og:title", content: ctx.title }],
      ["meta", { property: "og:description", content: ctx.description }],
      ["meta", { name: "twitter:title", content: ctx.title }],
      ["meta", { name: "twitter:description", content: ctx.description }],
    ];
  },
  vite: {
    define: {
      __TOASTFLOW_CORE_VERSION__: JSON.stringify(TOASTFLOW_CORE_VERSION),
      __VUE_TOASTFLOW_VERSION__: JSON.stringify(VUE_TOASTFLOW_VERSION),
      __TOASTFLOW_LOCAL_DEV__: JSON.stringify(isLocalDev),
    },
    plugins: [toastflowLocalDevPlugin()],
    optimizeDeps: {
      exclude: ["@vue/repl"],
    },
  },
  themeConfig: {
    siteTitle: "Toastflow",
    nav: [
      { text: "Guide", link: "/guide/introduction" },
      { text: "Examples", link: "/guide/live-examples" },
      { text: "Comparisons", link: "/comparisons/overview" },
      { text: "Toastflow API", link: "/api/configuration" },
      { text: "Components", link: "/components/toast-container" },
      { text: "Playground", link: "https://toastflow.top/" },
    ],
    sidebar: [
      {
        text: "Guide",
        collapsed: false,
        items: [
          { text: "Introduction", link: "/guide/introduction" },
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Live Examples", link: "/guide/live-examples" },
          { text: "Theming", link: "/guide/theming" },
          { text: "Toasts", link: "/guide/toasts" },
          { text: "Timers and Progress", link: "/guide/timers-and-progress" },
          { text: "Buttons and Actions", link: "/guide/buttons-and-actions" },
          { text: "Programmatic API", link: "/guide/programmatic-api" },
          { text: "Controlled Store", link: "/guide/controlled-store" },
        ],
      },
      {
        text: "Toastflow",
        collapsed: false,
        items: [
          { text: "Configuration", link: "/api/configuration" },
          { text: "State", link: "/api/state" },
          { text: "Events", link: "/api/events" },
          { text: "Actions", link: "/api/actions" },
          { text: "Getters", link: "/api/getters" },
          { text: "Slots", link: "/api/slots" },
          { text: "Utilities", link: "/api/utilities" },
        ],
      },
      {
        text: "Comparisons",
        collapsed: false,
        items: [
          { text: "Overview", link: "/comparisons/overview" },
          {
            text: "Toastflow vs vue3-notification",
            link: "/comparisons/overview#vs-vue3-notification",
          },
          {
            text: "Toastflow vs vue-sonner",
            link: "/comparisons/overview#vs-vue-sonner",
          },
          {
            text: "Toastflow vs vue-toast-notification",
            link: "/comparisons/overview#vs-vue-toast-notification",
          },
          {
            text: "Toastflow vs notivue",
            link: "/comparisons/overview#vs-notivue",
          },
          {
            text: "Toastflow vs vue3-toastify",
            link: "/comparisons/overview#vs-vue3-toastify",
          },
        ],
      },
      {
        text: "Components",
        collapsed: false,
        items: [
          { text: "ToastContainer", link: "/components/toast-container" },
          { text: "Toast", link: "/components/toast" },
          { text: "ToastProgress", link: "/components/toast-progress" },
          { text: "Icons", link: "/components/icons" },
        ],
      },
      {
        text: "Support",
        collapsed: false,
        items: [{ text: "Troubleshooting", link: "/troubleshooting" }],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/adrianjanocko/toastflow" },
    ],
    search: {
      provider: "local",
    },
    outline: {
      label: "On this page",
      level: [2, 3],
    },
    docFooter: {
      prev: "Previous",
      next: "Next",
    },
    editLink: {
      pattern:
        "https://github.com/adrianjanocko/toastflow/edit/main/packages/docs/vue/:path",
      text: "Suggest changes to this page",
    },
  },
});
