import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

const toastflowPackage = JSON.parse(
  readFileSync(new URL("../vue/package.json", import.meta.url), "utf8"),
) as { version?: string };
const toastflowCorePackage = JSON.parse(
  readFileSync(new URL("../core/package.json", import.meta.url), "utf8"),
) as { version?: string };
const publicAssetsDir = fileURLToPath(new URL("../../assets", import.meta.url));
const toastflowCoreDistDir = fileURLToPath(
  new URL("../core/dist", import.meta.url),
);
const toastflowVueDistDir = fileURLToPath(
  new URL("../vue/dist", import.meta.url),
);

loadLocalEnv();
process.env.NUXT_PUBLIC_SITE_URL ??= "https://www.toastflow.top";
process.env.NUXT_SITE_URL ??= "https://www.toastflow.top";

function loadLocalEnv() {
  const envFile = new URL(".env.local", import.meta.url);

  if (!existsSync(envFile)) {
    return;
  }

  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

    if (!match || !match[1] || match[1].startsWith("#")) {
      continue;
    }

    const value = (match[2] ?? "").trim().replace(/^(['"])(.*)\1$/, "$2");
    process.env[match[1]] ??= value;
  }
}

function envValue(name: string, defaultValue = "") {
  return process.env[name] ?? defaultValue;
}

function nonEmptyEnvValue(name: string, defaultValue: string) {
  const value = process.env[name]?.trim();

  return value ? value : defaultValue;
}

// Old docs lived on docs.toastflow.top; that domain now 308s to www with the
// path preserved, and these rules map the legacy paths to the new structure.
const legacyDocsPathMap: Record<string, string> = {
  "/guide/introduction": "/docs/global/overview",
  "/guide/getting-started": "/docs/vue/quick-start",
  "/guide/toasts": "/docs/vue/toasts",
  "/guide/timers-and-progress": "/docs/vue/timers-and-progress",
  "/guide/buttons-and-actions": "/docs/vue/buttons-and-actions",
  "/guide/theming": "/docs/global/styling",
  "/guide/controlled-store": "/docs/headless/core-store",
  "/guide/live-examples": "/docs/examples/live-examples",
  "/guide/programmatic-api": "/docs/api/actions",
  "/api/actions": "/docs/api/actions",
  "/api/configuration": "/docs/api/configuration",
  "/api/events": "/docs/api/events",
  "/api/state": "/docs/api/state",
  "/api/getters": "/docs/api/state",
  "/api/slots": "/docs/headless/headless-slot",
  "/api/utilities": "/docs/api/runtime-exports",
  "/troubleshooting": "/docs/more/troubleshooting",
};

function buildLegacyDocsRedirects() {
  const rules: Record<string, { redirect: { to: string; statusCode: 301 } }> =
    {};

  for (const [from, to] of Object.entries(legacyDocsPathMap)) {
    rules[from] = { redirect: { to, statusCode: 301 } };
    rules[`${from}.html`] = { redirect: { to, statusCode: 301 } };
  }

  return rules;
}

async function npmReleasedAt(packageName: string, version?: string) {
  const override = process.env.NUXT_PUBLIC_TOASTFLOW_RELEASED_AT?.trim();

  if (override) {
    return override;
  }

  if (!version || version === "latest") {
    return "";
  }

  const controller = new AbortController();
  const timeout = setTimeout(function () {
    controller.abort();
  }, 1500);

  try {
    const response = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(packageName)}`,
      {
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      return "";
    }

    const metadata = (await response.json()) as {
      time?: Record<string, string>;
    };

    return metadata.time?.[version] ?? "";
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

const toastflowReleasedAt = await npmReleasedAt(
  "vue-toastflow",
  toastflowPackage.version,
);

function envFlag(name: string, defaultValue = false) {
  const value = process.env[name]?.trim().toLowerCase();

  if (!value) {
    return defaultValue;
  }

  if (["1", "true", "yes", "on"].includes(value)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(value)) {
    return false;
  }

  return defaultValue;
}

function cliOptionValue(name: string) {
  const longOption = `--${name}`;
  const inlineOption = `${longOption}=`;
  const shortOption = name.length === 1 ? `-${name}` : "";
  const args = process.argv;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === longOption || (shortOption && arg === shortOption)) {
      return args[index + 1];
    }

    if (arg?.startsWith(inlineOption)) {
      return arg.slice(inlineOption.length);
    }
  }
}

function devServerPort() {
  return (
    nonEmptyEnvValue("NUXT_DOCUS_DEV_PORT", "") ||
    nonEmptyEnvValue("NUXT_PORT", "") ||
    nonEmptyEnvValue("NITRO_PORT", "") ||
    nonEmptyEnvValue("PORT", "") ||
    cliOptionValue("port") ||
    cliOptionValue("p") ||
    "3000"
  );
}

function isPortFree(port: number): Promise<boolean> {
  return new Promise(function (resolve) {
    const probe = createServer();
    probe.once("error", function () {
      resolve(false);
    });
    probe.once("listening", function () {
      probe.close(function () {
        resolve(true);
      });
    });
    probe.listen(port, "localhost");
  });
}

// Resolve the dev port before Nuxt does: when the preferred port is taken,
// Nuxt silently bumps to the next one, but config-time consumers (the Docus
// assistant MCP URL below) would still point at the dead port and the
// assistant fails with "fetch failed". Picking the free port here and
// pinning devServer.port keeps both in sync.
async function resolveDevPort(): Promise<number> {
  let port = Number(devServerPort());
  while (!(await isPortFree(port))) {
    port += 1;
  }
  return port;
}

const resolvedDevPort =
  process.env.NODE_ENV !== "production" ? await resolveDevPort() : null;

function docusMcpServer() {
  const override = process.env.NUXT_DOCUS_MCP_SERVER?.trim();

  if (override) {
    return override;
  }

  if (resolvedDevPort !== null) {
    // "localhost", not 127.0.0.1: on Windows the dev server may listen on
    // the IPv6 loopback (::1) only, and a hardcoded IPv4 address is refused.
    return `http://localhost:${resolvedDevPort}/mcp`;
  }

  return "/mcp";
}

function dropDevOnlyRootPrerender(nitroConfig: {
  prerender?: { routes?: unknown[] };
  routeRules?: Record<string, { prerender?: unknown }>;
}) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  if (nitroConfig.prerender?.routes) {
    nitroConfig.prerender.routes = nitroConfig.prerender.routes.filter(
      (route) => route !== "/",
    );
  }

  if (!nitroConfig.routeRules) {
    return;
  }

  delete nitroConfig.routeRules["//_payload.json"];

  const rootRules = nitroConfig.routeRules["/"];
  if (rootRules?.prerender) {
    delete rootRules.prerender;

    if (Object.keys(rootRules).length === 0) {
      delete nitroConfig.routeRules["/"];
    }
  }
}

export default defineNuxtConfig({
  extends: ["docus"],
  modules: ["@nuxtjs/sitemap"],
  // In `nuxt dev` the REPL loads the local workspace builds (see
  // ToastflowRepl.vue) so unpublished features are testable; production
  // stays on the pinned CDN versions.
  $development: {
    vite: {
      define: {
        __TOASTFLOW_LOCAL_DEV__: JSON.stringify(true),
      },
    },
    nitro: {
      publicAssets: [
        {
          baseURL: "/@toastflow-local/core",
          dir: toastflowCoreDistDir,
          maxAge: 0,
        },
        {
          baseURL: "/@toastflow-local/vue",
          dir: toastflowVueDistDir,
          maxAge: 0,
        },
      ],
    },
  },
  ...(resolvedDevPort !== null ? { devServer: { port: resolvedDevPort } } : {}),
  devtools: {
    enabled: envFlag("NUXT_DEVTOOLS"),
  },
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
    },
  },
  // @nuxt/fonts (via Docus → @nuxt/ui) downloads these at build time and
  // self-hosts them under /_fonts with preloads + metric-adjusted fallbacks.
  fonts: {
    families: [
      {
        name: "Manrope",
        provider: "google",
        weights: [400, 500, 600, 700, 800],
      },
      { name: "Fraunces", provider: "google", weights: [600, 700] },
    ],
  },
  vite: {
    define: {
      __TOASTFLOW_CORE_VERSION__: JSON.stringify(
        toastflowCorePackage.version ?? "latest",
      ),
      __VUE_TOASTFLOW_VERSION__: JSON.stringify(
        toastflowPackage.version ?? "latest",
      ),
      __TOASTFLOW_LOCAL_DEV__: JSON.stringify(false),
    },
    optimizeDeps: {
      include: [
        "@highlightjs/vue-plugin",
        "highlight.js/lib/common",
        "remark-emoji",
        "remark-mdc",
        "vue-snowfall",
        "@giscus/vue",
      ],
      exclude: ["@vue/repl"],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("@vue/repl")) {
              return "vue-repl";
            }
          },
        },
      },
    },
  },
  experimental: {
    defaults: {
      nuxtLink: {
        prefetch: process.env.NODE_ENV === "production",
      },
    },
  },
  site: {
    url: "https://www.toastflow.top",
    name: "Toastflow",
  },
  llms: {
    domain: "https://www.toastflow.top",
    title: "Toastflow",
    description:
      "Accessible toast notifications for Vue, Nuxt, and headless apps.",
    full: {
      title: "Toastflow",
      description:
        "Accessible toast notifications for Vue, Nuxt, and headless apps.",
    },
  },
  routeRules: {
    ...buildLegacyDocsRedirects(),
    "/guide/**": {
      redirect: { to: "/docs/global/overview", statusCode: 301 },
    },
    "/components/**": {
      redirect: { to: "/docs/global/overview", statusCode: 301 },
    },
    "/comparisons/**": {
      redirect: { to: "/docs/more/comparisons", statusCode: 301 },
    },
    "/docs": {
      redirect: "/docs/global/overview",
    },
    "/docs/**": {
      isr: 3600,
    },
    "/docs/api": {
      redirect: "/docs/api/configuration",
    },
    "/docs/more": {
      redirect: "/docs/more/troubleshooting",
    },
    "/playground": {
      redirect: "/",
    },
  },
  icon: {
    provider: "server",
    clientBundle: {
      scan: true,
    },
  },
  nitro: {
    publicAssets: [
      {
        baseURL: "/",
        dir: publicAssetsDir,
      },
    ],
    compressPublicAssets: true,
  },
  hooks: {
    "nitro:config": dropDevOnlyRootPrerender,
  },
  docus: {
    assistant: {
      mcpServer: docusMcpServer(),
      model: nonEmptyEnvValue(
        "NUXT_DOCUS_ASSISTANT_MODEL",
        "google/gemini-3-flash",
      ),
    },
  },
  runtimeConfig: {
    public: {
      toastflowVersion: toastflowPackage.version ?? "0.0.0",
      toastflowReleasedAt,
      seasonalMode: envValue("NUXT_PUBLIC_SEASONAL_MODE", "off"),
      umamiWebsiteId: envValue("NUXT_PUBLIC_UMAMI_WEBSITE_ID"),
      giscus: {
        repo: envValue("NUXT_PUBLIC_GISCUS_REPO"),
        repoId: envValue("NUXT_PUBLIC_GISCUS_REPO_ID"),
        category: envValue("NUXT_PUBLIC_GISCUS_CATEGORY"),
        categoryId: envValue("NUXT_PUBLIC_GISCUS_CATEGORY_ID"),
        mapping: envValue("NUXT_PUBLIC_GISCUS_MAPPING", "pathname"),
        theme: envValue("NUXT_PUBLIC_GISCUS_THEME", "light"),
        themeLight: envValue("NUXT_PUBLIC_GISCUS_THEME_LIGHT", "light"),
        themeDark: envValue("NUXT_PUBLIC_GISCUS_THEME_DARK", "dark_dimmed"),
        strict: envValue("NUXT_PUBLIC_GISCUS_STRICT", "0"),
      },
    },
  },
});
